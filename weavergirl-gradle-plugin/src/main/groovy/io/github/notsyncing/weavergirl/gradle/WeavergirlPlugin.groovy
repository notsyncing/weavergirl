package io.github.notsyncing.weavergirl.gradle

import org.codehaus.plexus.archiver.jar.JarArchiver
import org.codehaus.plexus.archiver.tar.TarArchiver
import org.codehaus.plexus.archiver.tar.TarLongFileMode
import org.codehaus.plexus.archiver.util.DefaultFileSet
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.file.FileTree

import java.nio.file.FileSystems
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

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

    @Override
    void apply(Project project) {
        project.extensions.create("weavergirl", WeavergirlPluginExtension)

        def makeAppTask = project.task("makeWeavergirlApp").doLast {
            def outputDir = project.buildDir.toPath().resolve("weavergirl/app")

            if (Files.exists(outputDir)) {
                project.delete(outputDir.toFile())
            }

            Files.createDirectories(outputDir)

            for (d in project.configurations.compile) {
                if (!d.isFile()) {
                    continue
                }

                if (!d.getName().endsWith(".jar")) {
                    continue
                }

                def type = DependencyType.PlainJar

                FileSystems.newFileSystem(d.toPath(), null).withCloseable { fs ->
                    def p = fs.getPath("META-INF/resources/webjars")

                    if (Files.exists(p)) {
                        type = DependencyType.WebJar
                    }

                    null
                }

                switch (type) {
                    case DependencyType.PlainJar:
                        project.copy {
                            from project.zipTree(d)
                            into outputDir.toFile()
                            exclude 'META-INF/**'
                        }

                        break
                    case DependencyType.WebJar:
                        copySubdirectoryFromFileTree(project, project.zipTree(d),
                                "META-INF/resources/webjars", outputDir)

                        break
                    default:
                        throw new InvalidObjectException("Unsupported dependency type ${type}")
                }
            }

            def appDir = outputDir.resolve(project.name)

            Files.createDirectories(appDir)

            project.copy {
                from project.extensions.weavergirl.srcDir
                into appDir.toFile()
                exclude 'index.html'
            }

            for (f in project.extensions.weavergirl.additionalFiles) {
                project.copy {
                    from f
                    into appDir.toFile()
                }
            }

            def indexFile = Paths.get(project.extensions.weavergirl.srcDir, "index.html")

            if (Files.exists(indexFile)) {
                Files.copy(indexFile, outputDir.resolve("index.html"))
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
            def name = "${project.name}-${project.version}.jar"
            def s = jarDir.parent.parent.resolve(name)

            if (Files.exists(jarDir)) {
                project.delete(jarDir.toFile())
            }

            if (Files.exists(s)) {
                Files.delete(s)
            }

            project.copy {
                from project.extensions.weavergirl.srcDir
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
        }
    }
}
