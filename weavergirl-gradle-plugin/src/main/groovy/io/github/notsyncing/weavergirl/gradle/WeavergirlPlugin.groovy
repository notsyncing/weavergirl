package io.github.notsyncing.weavergirl.gradle

import org.apache.tools.ant.taskdefs.condition.Os
import org.codehaus.plexus.archiver.jar.JarArchiver
import org.codehaus.plexus.archiver.tar.TarArchiver
import org.codehaus.plexus.archiver.tar.TarLongFileMode
import org.codehaus.plexus.archiver.util.DefaultFileSet
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.file.FileTree

import java.nio.file.*
import java.nio.file.attribute.BasicFileAttributes
import java.util.zip.Adler32

class WeavergirlPlugin implements Plugin<Project> {
    private void copySubdirectoryFromFileTree(Project project, FileTree fromTree, String dirToCopy, Path toDir) {
        def tempDir = File.createTempDir("weavergirl-gradle-temp-", "")

        project.copy {
            from fromTree
            into tempDir
        }

        project.copy {
            from tempDir.toPath().resolve(dirToCopy).toFile()
            into toDir.toFile()
        }

        project.delete(tempDir)
    }

    private long checksum(Path file) {
        def m = new Adler32()
        m.update(Files.readAllBytes(file))

        return m.value
    }

    private void babelDirectory(Project project, Path srcDir, Path targetDir, String[] skipFiles) {
        def babelLevel = project.extensions.weavergirl.babelLevel

        project.exec {
            workingDir targetDir.toFile()

            if (Os.isFamily(Os.FAMILY_MAC)) {
                commandLine "/usr/local/bin/node", "/usr/local/bin/npm", "link", "babel-preset-es2015",
                        "babel-preset-env", "babel-plugin-transform-decorators-legacy"
            } else {
                commandLine "npm", "link", "babel-preset-es2015", "babel-preset-env",
                        "babel-plugin-transform-decorators-legacy"
            }
        }

        def checksumFile = targetDir.resolve("../../.weavergirlBabelChecksums")
        def checksums = new HashMap<String, Long>()

        if (Files.exists(checksumFile)) {
            new ObjectInputStream(Files.newInputStream(checksumFile)).withCloseable {
                checksums = it.readObject()
            }
        }

        Files.walkFileTree(srcDir, new FileVisitor<Path>() {
            @Override
            FileVisitResult preVisitDirectory(Path d, BasicFileAttributes attrs) throws IOException {
                if (d.fileName.toString() == "node_modules") {
                    return FileVisitResult.SKIP_SUBTREE
                }

                return FileVisitResult.CONTINUE
            }

            @Override
            FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                def relFile = srcDir.relativize(file)

                if (!file.fileName.toString().endsWith(".js")) {
                    def targetFile = targetDir.resolve(relFile)
                    Files.createDirectories(targetFile.parent)

                    project.copy {
                        from file.toFile()
                        into targetFile.parent.toFile()
                    }

                    return FileVisitResult.CONTINUE
                }

                if (skipFiles.contains(file.toString())) {
                    return FileVisitResult.CONTINUE
                }

                def newChecksum = checksum(file)

                if (checksums.containsKey(relFile.toString())) {
                    def oldChecksum = checksums.get(relFile.toString())

                    if (oldChecksum == newChecksum) {
                        println("up-to-date: ${file}")
                        return FileVisitResult.CONTINUE
                    }
                }

                def targetFile = targetDir.resolve(relFile)

                if (!Files.exists(targetFile.parent)) {
                    Files.createDirectories(targetFile.parent)
                }

                project.exec {
                    workingDir targetDir.toFile()

                    def parameters = [
                            file.toString(),
                            "-o", relFile.toString()
                    ]

                    if (babelLevel == "full") {
                        parameters.add("--presets")
                        parameters.add(targetDir.resolve("node_modules/babel-preset-es2015").toString())
                        parameters.add("--plugins")
                        parameters.add(targetDir.resolve("node_modules/babel-plugin-transform-decorators-legacy").toString())
                    } else if (babelLevel == "decorators") {
                        parameters.add("--plugins")
                        parameters.add(targetDir.resolve("node_modules/babel-plugin-transform-decorators-legacy").toString())
                    }

                    if (Os.isFamily(Os.FAMILY_MAC)) {
                        parameters.add(0, "/usr/local/bin/node")
                        parameters.add(1, "/usr/local/bin/babel")
                    } else {
                        parameters.add(0, "babel")
                    }

                    commandLine(*parameters)
                }

                println("babel: ${file} to ${targetDir.resolve(relFile)}")

                checksums.put(relFile.toString(), newChecksum)

                return FileVisitResult.CONTINUE
            }

            @Override
            FileVisitResult visitFileFailed(Path file, IOException exc) throws IOException {
                println("Error occured when visiting file ${file}: ${exc.message}")
                exc.printStackTrace()
                return FileVisitResult.CONTINUE
            }

            @Override
            FileVisitResult postVisitDirectory(Path d, IOException exc) throws IOException {
                return FileVisitResult.CONTINUE
            }
        })

        project.delete(targetDir.resolve("node_modules").toFile())

        new ObjectOutputStream(Files.newOutputStream(checksumFile)).withCloseable {
            it.writeObject(checksums)
        }
    }

    @Override
    void apply(Project project) {
        project.extensions.create("weavergirl", WeavergirlPluginExtension)

        def makeAppTask = project.task("makeWeavergirlApp").doLast {
            def outputDir = project.buildDir.toPath().resolve("weavergirl/app")

            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir)
            }

            for (d in project.configurations.compile.resolvedConfiguration.resolvedArtifacts) {
                if (!d.file.isFile()) {
                    continue
                }

                if (!d.file.getName().endsWith(".jar")) {
                    continue
                }

                def type = DependencyType.PlainJar

                FileSystems.newFileSystem(d.file.toPath(), null).withCloseable { fs ->
                    def p = fs.getPath("META-INF/resources/webjars")

                    if (Files.exists(p)) {
                        type = DependencyType.WebJar
                    }

                    null
                }

                def depItemDirName = d.file.getName().substring(0, d.file.getName().lastIndexOf("."))
                def depItemDir = outputDir.resolve(depItemDirName)

                if (Files.exists(depItemDir)) {
                    project.delete(depItemDir.toFile())
                }

                switch (type) {
                    case DependencyType.PlainJar:
                        project.copy {
                            from project.zipTree(d.file)
                            into outputDir.toFile()
                            exclude 'META-INF/**'
                        }

                        break
                    case DependencyType.WebJar:
                        copySubdirectoryFromFileTree(project, project.zipTree(d.file),
                                "META-INF/resources/webjars", outputDir)

                        break
                    default:
                        throw new InvalidObjectException("Unsupported dependency type ${type}")
                }
            }

            def appDir = outputDir.resolve(project.name)

            if (!Files.exists(appDir)) {
                Files.createDirectories(appDir)
            }

            if (!project.extensions.weavergirl.useBabel) {
                if (project.extensions.weavergirl.srcDir != null) {
                    project.copy {
                        from project.extensions.weavergirl.srcDir
                        into appDir.toFile()
                        exclude 'index.html'
                    }
                }
            }

            for (f in project.extensions.weavergirl.additionalFiles) {
                project.copy {
                    from f
                    into appDir.toFile()
                }
            }

            def indexFile = Paths.get(project.extensions.weavergirl.srcDir, "index.html")

            if (Files.exists(indexFile)) {
                Files.copy(indexFile, outputDir.resolve("index.html"), StandardCopyOption.REPLACE_EXISTING)
            }

            if (project.extensions.weavergirl.useBabel) {
                def srcDir = project.projectDir.toPath().resolve(project.extensions.weavergirl.srcDir)

                babelDirectory(project, srcDir, appDir, project.extensions.weavergirl.babelSkipFiles)
            }
        }

        def makeAppPackageTask = project.task("makeWeavergirlAppPackage").doLast {
            def appDir = project.buildDir.toPath().resolve("weavergirl/app")
            def name = "${project.name}-${project.version}.tar.gz"
            def s = appDir.parent.resolve(name)

            if (Files.exists(s)) {
                Files.delete(s)
            }

            def files = new DefaultFileSet()
            files.includeEmptyDirs(true)
            files.directory = appDir.toFile()

            def archiver = new TarArchiver()
            archiver.compression = TarArchiver.TarCompressionMethod.gzip
            archiver.longfile = TarLongFileMode.posix
            archiver.addFileSet(files)
            archiver.setDestFile(s.toFile())
            archiver.createArchive()
        }

        def makeJarTask = project.task("makeWeavergirlJar").doLast {
            def jarDir = project.buildDir.toPath().resolve("weavergirl/jar/${project.name}")
            def appDir = project.buildDir.toPath().resolve("weavergirl/app/${project.name}")
            def name = "${project.name}-${project.version}.jar"
            def s = jarDir.parent.parent.resolve(name)

            if (Files.exists(jarDir)) {
                project.delete(jarDir.toFile())
            }

            if (Files.exists(s)) {
                Files.delete(s)
            }

            project.copy {
                from appDir.toFile()
                into jarDir.toFile()
                exclude 'index.html'
            }

            for (f in project.extensions.weavergirl.additionalFiles) {
                project.copy {
                    from f
                    into jarDir.toFile()
                }
            }

            def files = new DefaultFileSet()
            files.includeEmptyDirs(true)
            files.directory = jarDir.parent.toFile()

            def archiver = new JarArchiver()
            archiver.compress = true
            archiver.addFileSet(files)
            archiver.setDestFile(s.toFile())
            archiver.createArchive()
        }

        project.afterEvaluate {
            makeAppPackageTask.dependsOn(makeAppTask)
            makeJarTask.dependsOn(makeAppTask)
        }
    }
}
