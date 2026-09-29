function generateContext(
  scanResult,
  analysis,
  health,
  readme
) {

  const context = {

    project: {
      name: analysis.projectName
    },


    technology: {

      languages: analysis.languages,

      frameworks: analysis.frameworks,

      tools: analysis.tools

    },


    dependencies: {

      production: analysis.dependencies,

      development: analysis.devDependencies

    },


    structure: {

      totalFiles: scanResult.files.length,

      totalFolders: scanResult.folders.length,

      files: scanResult.files,

      folders: scanResult.folders

    },


    health: {

      score: health.score,

      passedChecks: health.passedChecks,

      failedChecks: health.failedChecks,

      checks: health.checks

    },


    documentation: {

      readmeExists: readme.exists,

      score: readme.score,

      mentionedTechnologies:
        readme.mentionedTechnologies,

      detectedTechnologies:
        readme.detectedTechnologies,

      mismatches:
        readme.mismatches

    }

  };


  return context;
}


module.exports = {
  generateContext
};