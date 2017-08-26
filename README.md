# sequelize-sluggify

## Important

This is a fork from [Jarrod Connolly's sequelize-slugify](https://github.com/jarrodconnolly/sequelize-slugify) module. To be able to work with Sequelize version 4, I have rewritten most of it's code. Almost all text below is written by Jarrod Connolly and this version has been rewritten with almost the same API (sluggify seems to be a more used term than slugify), so that it can be used without having to change all code related to slugs.

--------------------

sequelize-sluggify is a model plugin for Sequelize that automatically creates and updates unique slugs for your models.

So far this module has only been tested with the PostgreSQL database.

## Installation

`npm install sequelize-sluggify`

## Requirements

You must place a slug field on your model something like this.

```javascript
slug: {
    type: DataTypes.STRING,
    unique: true
}
```

## Options

sluggifyModel takes an options object as it's second parameter.

```javascript
SequelizeSluggify.sluggifyModel(User, {
    source: ['givenName'],
    slugOptions: { lower: true },
    overwrite: false,
    column: 'slug'
});

```
Available Options

- `source` - (Required) Array of field names in the model to build the slug from.
- `suffixSource` - (Optional) Array of field names in the model to use as the source for additional suffixes to make the slug unique (before defaulting to adding numbers to the end of the slug).
- `slugOptions` - (Default `{lower: true}`) Pass additional options for slug generation as defined by [`slug`](https://github.com/dodo/node-slug).
- `overwrite` - (Default `TRUE`) Change the slug if the source fields change once the slug has already been built.
- `column` - (Default `slug`) Specify which column the slug is to be stored into in the model.
- `reservedSlugs` - (Default `[]`) Specify which slugs should be considered as 'reserved' and will therefor be skipped.

## Usage Examples

### Basic Usage

```javascript

var SequelizeSluggify = require('sequelize-sluggify');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
            slug: {
                type: DataTypes.STRING,
                unique: true
            },
            emailAddress: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            givenName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            familyName: {
                type: DataTypes.STRING,
                allowNull: false
            }
        });

    SequelizeSluggify.sluggifyModel(User, {
        source: ['givenName', 'familyName']
    });

    return User;
};

```

### Suffix Sources

```javascript

var SequelizeSluggify = require('sequelize-sluggify');

module.exports = function(sequelize, DataTypes) {
    var Movie = sequelize.define('Movie', {
            slug: {
                type: DataTypes.STRING,
                unique: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            year: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });

    SequelizeSluggify.sluggifyModel(Movie, {
        source: ['title'],
        suffixSource: ['year']
    });

    return Movie;
};

```
