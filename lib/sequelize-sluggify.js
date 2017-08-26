'use strict';

var slug = require("slug");

class SequelizeSluggify {
    sluggifyModel(Model, options) {
        if(!options) {
            options = {};
        }

        if(typeof options.column === "undefined") {
            options.column = "slug";
        }

        if(typeof options.source === "undefined") {
            throw new Error("options.source is required");
        }

        if(typeof options.source === "string") {
            options.source = [options.source];
        }

        if(!Array.isArray(options.source)) {
            throw new Error("options.source is not a string or array");
        }

        if(typeof options.overwrite === "undefined") {
            options.overwrite = true;
        }

        if(typeof options.suffixSource === "undefined") {
            options.suffixSources = [];
        }

        var composeSlug = (instance, fields) => {
            var parts = fields.map(field => instance[field] || " ");

            return slug(parts.join(" "), Object.assign({ lower: true }, options.slugOptions));
        }

        var isAvailable = (slug) => {
            var query = {
                where: {}
            };

            query.where[options.column] = slug;

            return Model.find(query)
            .then((model) => {
                return Promise.resolve(model === null);
            });
        }

        var addFieldSuffix = (instance, count) => {
            if(!count) {
                count = 1;
            }

            if(!options.suffixSource || !Array.isArray(options.suffixSource)) {
                return Promise.resolve();
            }

            var slug = composeSlug(instance, options.source.concat(options.suffixSource.slice(0, count)));

            if(count > options.suffixSource.length) {
                return Promise.resolve(slug);
            }

            return isAvailable(slug)
            .then((available) => {
                if(available) {
                    return Promise.resolve(slug);
                }

                return addFieldSuffix(instance, count + 1);
            });
        };

        var addNumberSuffix = (slug, count) => {
            if(!count) {
                count = 1;
            }

            var suffixedSlug = slug + "-" + count;

            return isAvailable(suffixedSlug)
            .then((available) => {
                if(available) {
                    return Promise.resolve(slug);
                }

                return addNumberSuffix(slug, count + 1);
            });
        };

        var handleSluggify = (instance, options) => {
            var valuesChanged = options.source.map((field) => {
                return instance.changed(field);
            });

            var slug = instance[options.column];

            if(slug && !(options.overwrite && valuesChanged)) {
                return Promise.resolve();
            }

            slug = composeSlug(instance, options.source);

            return isAvailable(slug)
            .then((available) => {
                if(available) {
                    return Promise.resolve(slug);
                }

                return addFieldSuffix(instance);
            })
            .then((newSlug) => {
                if(!newSlug) {
                    return Promise.resolve();
                }

                slug = newSlug;

                return isAvailable(slug);
            })
            .then((available) => {
                if(available) {
                    return Promise.resolve(slug);
                }

                return addNumberSuffix(slug);
            })
            .then((slug) => {
                instance[options.column] = slug;

                return Promise.resolve();
            });
        };

        Model.addHook("beforeCreate", "generateSlug", handleSluggify);
        Model.addHook("beforeUpdate", "generateSlug", handleSluggify);
    }
}

module.exports = new SequelizeSluggify();
