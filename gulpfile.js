const gulp = require('gulp');
//const zip = require('gulp-zip');
const release = require('gulp-github-release');
const fs = require('fs');
const replace = require('gulp-replace');
const run = require('gulp-run');


var package_json = JSON.parse(fs.readFileSync('./package.json'));
var release_filename = package_json.name + '-v' + package_json.version + '.kpz';

var pm_file = 'CoverFlow.pm';
var pm_file_path = 'Koha/Plugin/Com/ByWaterSolutions/';
var pm_file_path_full = pm_file_path + pm_file;
var pm_file_path_dist = 'dist/' + pm_file_path;
var pm_file_path_full_dist = pm_file_path_dist + pm_file;

console.log(release_filename);
console.log(pm_file_path_full_dist);

gulp.task('build', () => {
    run('
        mkdir dist ;
        cp -ar Koha dist/. ;
        cp -ar JavaScript dist/. ;
        sed -i -e "s/{VERSION}/' + package_json.version + '/g" ' + pm_file_path_full_dist + ' ;
        sed -i -e "s/1900-01-01/${today}/g" ${pm_file_path_full_dist} ;
        cd dist ;
        zip -r ../' + release_filename + ' ./Koha ./JavaScript ;
        cd .. ;
        rm -rf dist ;
    ').exec();

});

gulp.task('release', () => {
    gulp.src(release_filename)
        .pipe(release({
            manifest: require('./package.json') // package.json from which default values will be extracted if they're missing
        }));
});

/*
    // Set module version 
    gulp.src(pm_file_path_full)
        .pipe(replace('{VERSION}', package_json.version))
        .pipe(gulp.dest(pm_file_path_dist));

    //FIXME: This doesn't work! It only zips of the first level of directories, leaving them empty
    gulp.src(['./*', '!gulpfile.js', '!node_modules', '!package.json', '!README.md'])
        .pipe(zip(release_filename))
        .pipe(gulp.dest('./'));
*/
