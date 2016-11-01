/*jslint node: true*/
/*global describe, it, before*/

"use strict";

var splitFiles = require("../index"),

    path = require("path"),
    File = require('vinyl'),
    assert = require("assert"),

    testUtil = {
        createFakeFile: function (fileName, fileContent) {
            return new File({
                path: fileName,
                contents: new Buffer(fileContent)
            });
        }
    };

describe("Simple split", function () {

    var testFile = "testfile1",
        fileName = testFile + ".txt",
        fileContent = "first/*split*/second",
        newfileNames = [testFile + "-0.txt", testFile + "-1.txt"],
        fileCount = 0,
        fileStream = fileContent.split("/*split*/");

    describe("Should split the file '" + fileName + "' in two new files.", function () {
        it("should deliver a file stream containing two files (" + newfileNames.join(" & ") + ")", function (done) {

            var fakeFile = testUtil.createFakeFile(fileName, fileContent),
                split = splitFiles();

            split.write(fakeFile);

            split.on("data", function (file) {
                var filename = path.basename(file.path);

                assert(file.isBuffer());
                assert.equal(filename, newfileNames[fileCount]);
                assert.equal(file.contents.toString('utf8'), fileStream[fileCount]);

                fileCount += 1;

                if (fileCount === fileStream.length) {
                    done();
                }
            });
        });
    });

});

describe("Named split", function () {

    var testFile = "testfile2",
        fileName = testFile + ".txt",
        fileContent = "/*splitfilename=first.txt*/first/*split*//*splitfilename=second.txt*/second",
        newFileContent = ["first", "second"],
        newfileNames = ["first.txt", "second.txt"],
        fileCount = 0,
        fileStream = fileContent.split("/*split*/");

    describe("Split '" + fileName + "' into two new named files", function () {
        it("Should deliver a file stream containing two files (" + newfileNames.join(" & ") + ")", function (done) {

            fileCount = 0;

            var fakeFile = testUtil.createFakeFile(fileName, fileContent),
                split = splitFiles();

            split.write(fakeFile);

            split.on("data", function (file) {
                var filename = path.basename(file.path);

                assert(file.isBuffer());
                assert.equal(filename, newfileNames[fileCount]);

                fileCount += 1;

                if (fileCount === fileStream.length) {
                    done();
                }
            });
        });

        it("Should remove the splitfilename comment from the new files", function (done) {

            fileCount = 0;

            var fakeFile = testUtil.createFakeFile(fileName, fileContent),
                split = splitFiles();

            split.write(fakeFile);

            split.on("data", function (file) {

                assert(file.isBuffer());
                assert.equal(file.contents.toString('utf8'), newFileContent[fileCount]);

                fileCount += 1;

                if (fileCount === fileStream.length) {
                    done();
                }
            });
        });
    });

});