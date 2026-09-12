const path = require("node:path");
const fs = require("node:fs");

const projectDistPath = path.join(__dirname, "project-dist");
const templateHtmlPath = path.join(__dirname, "template.html");
const componentsPath = path.join(__dirname, "components");
const indexHtmlPath = path.join(projectDistPath, "index.html");
const projectDistAssetsPath = path.join(projectDistPath, "assets");
const assetsPath = path.join(__dirname, "assets");
const styleCssPath = path.join(projectDistPath, "style.css");
const stylesPath = path.join(__dirname, "styles");

const createProjectDist = () => {
  fs.mkdir(projectDistPath, () => {
    buildIndexHtml();
    buildStyleCss();
    copyAssets();
  });
};

const buildIndexHtml = () => {
  fs.readFile(templateHtmlPath, { encoding: "utf8" }, (_, templateHtmlData) => {
    let indexHtmlData = templateHtmlData;
    fs.readdir(
      componentsPath,
      { withFileTypes: true },
      (_, componentsFiles) => {
        componentsFiles
          .filter((file) => file.isFile())
          .filter((htmlFile) => path.extname(htmlFile.name) === ".html")
          .forEach((htmlFile) => {
            const htmlFilePath = path.join(componentsPath, htmlFile.name);
            const htmlFileName = path.basename(htmlFilePath, ".html");
            fs.readFile(
              htmlFilePath,
              { encoding: "utf8" },
              (_, htmlFileData) => {
                const indexHtmlSectionName = `{{${htmlFileName}}}`;
                indexHtmlData = indexHtmlData.replaceAll(
                  indexHtmlSectionName,
                  htmlFileData,
                );
                fs.writeFile(
                  indexHtmlPath,
                  indexHtmlData,
                  { encoding: "utf8" },
                  () => {},
                );
              },
            );
          });
      },
    );
  });
};

const buildStyleCss = () => {
  fs.readdir(stylesPath, { withFileTypes: true }, (_, stylesFiles) => {
    const styleCssWriteStream = fs.createWriteStream(styleCssPath);
    stylesFiles
      .filter((file) => file.isFile())
      .filter((cssFile) => path.extname(cssFile.name) === ".css")
      .forEach((cssFile) => {
        const cssFilePath = path.join(stylesPath, cssFile.name);
        const cssFileReadStream = fs.createReadStream(cssFilePath, {
          encoding: "utf8",
        });
        cssFileReadStream.pipe(styleCssWriteStream);
      });
  });
};

const copyAssets = () => {
  fs.rm(projectDistAssetsPath, { recursive: true }, () => {
    fs.mkdir(projectDistAssetsPath, () => {
      fs.readdir(
        assetsPath,
        { recursive: true, withFileTypes: true },
        (_, assetsElements) => {
          assetsElements
            .filter((assetsDirectory) => assetsDirectory.isDirectory())
            .forEach((assetsDirectory) => {
              const assetsDirectoryPath = path.join(
                assetsDirectory.parentPath,
                assetsDirectory.name,
              );
              const assetsDirectoryRelativePath = path.relative(
                assetsPath,
                assetsDirectoryPath,
              );
              const projectDistAssetsDirectoryPath = path.join(
                projectDistAssetsPath,
                assetsDirectoryRelativePath,
              );
              fs.mkdir(
                projectDistAssetsDirectoryPath,
                { recursive: true },
                () => {},
              );
            });

          assetsElements
            .filter((assetsFile) => assetsFile.isFile())
            .forEach((assetsFile) => {
              const assetsFilePath = path.join(
                assetsFile.parentPath,
                assetsFile.name,
              );
              const assetsFileRelativePath = path.relative(
                assetsPath,
                assetsFilePath,
              );
              const projectDistAssetsFilePath = path.join(
                projectDistAssetsPath,
                assetsFileRelativePath,
              );
              const projectDistAssetsFileDirectoryPath = path.dirname(
                projectDistAssetsFilePath,
              );
              fs.mkdir(
                projectDistAssetsFileDirectoryPath,
                { recursive: true },
                () => {
                  fs.copyFile(
                    assetsFilePath,
                    projectDistAssetsFilePath,
                    () => {},
                  );
                },
              );
            });
        },
      );
    });
  });
};

createProjectDist();
