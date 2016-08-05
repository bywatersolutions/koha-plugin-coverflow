const gulp = require('gulp');
const zip = require('gulp-zip');
const release = require('gulp-github-release');
const fs = require('fs');
const replace = require('gulp-replace');
const git = require('gulp-git');


var package_json = JSON.parse(fs.readFileSync('./package.json'));
var release_filename = package_json.name + '-v' + package_json.version + '.kpz';

var pm_file = 'CoverFlow.pm';
var pm_file_path = './Koha/Plugin/Com/ByWaterSolutions/';
var pm_file_path_full = pm_file_path + pm_file;

console.log(release_filename);

gulp.task('build', () => {
    // Set module version 
    gulp.src(pm_file_path_full)
        .pipe(replace('{VERSION}', package_json.version))
        .pipe(gulp.dest(pm_file_path));

    //FIXME: This doesn't work! It only zips of the first level of directories, leaving them empty
    gulp.src(['./*', '!gulpfile.js', '!node_modules', '!package.json', '!README.md'])
        .pipe(zip(release_filename))
        .pipe(gulp.dest('./'));
});

gulp.task('release', () => {
    gulp.src(release_filename)
        .pipe(release({
            manifest: require('./package.json') // package.json from which default values will be extracted if they're missing
        }))
        .pipe(git.checkoutFiles());
});

