# Introduction

Koha’s Plugin System (available in Koha 3.12+) allows for you to add additional tools and reports to [Koha](http://koha-community.org) that are specific to your library. Plugins are installed by uploading KPZ ( Koha Plugin Zip ) packages. A KPZ file is just a zip file containing the perl files, template files, and any other files necessary to make the plugin work. Learn more about the Koha Plugin System in the [Koha 3.22 Manual](http://manual.koha-community.org/3.22/en/pluginsystem.html) or watch [Kyle’s tutorial video](http://bywatersolutions.com/2013/01/23/koha-plugin-system-coming-soon/).

# Downloading

From the [release page](https://github.com/bywatersolutions/koha-plugin-coverflow/releases) you can download the relevant *.kpz file

# Installing

Koha's Plugin System allows for you to add additional tools and reports to Koha that are specific to your library. Plugins are installed by uploading KPZ ( Koha Plugin Zip ) packages. A KPZ file is just a zip file containing the perl files, template files, and any other files necessary to make the plugin work.

The plugin system needs to be turned on by a system administrator.

To set up the Koha plugin system you must first make some changes to your install.

* Change `<enable_plugins>0<enable_plugins>` to `<enable_plugins>1</enable_plugins>` in your koha-conf.xml file
* Confirm that the path to `<pluginsdir>` exists, is correct, and is writable by the web server
* Restart your webserver
* Restart memcached if you are using it

Once set up is complete you will need to alter your UseKohaPlugins system preference. On the Tools page you will see the Tools Plugins and on the Reports page you will see the Reports Plugins.

# Setup

Once the plugin is installed you can find it under Admin->Manage plugins, currently the coverflow is neither a tool or report plugin, you can also select 'Show all plugins' after following the 'Plugins' link in reports or tools

The steps to get your coverflow to show up are as follows:

## Generate a public report

First, you need to create one or more **public** reports for your coverflow widget or widgets to be based on. This is how the plugin knows what the content of your widget should contain. Each report needs only three columns; title, biblionumber, and isbn. It is important that you have a good and valid isbn, as that is the datum used to actually fetch the cover. Example finding items added in the last 30 days:

```SQL
SELECT b.biblionumber, SUBSTRING_INDEX(m.isbn, ' ', 1) AS isbn, b.title
  FROM items i
  LEFT JOIN biblioitems m USING (biblioitemnumber)
  LEFT JOIN biblio b ON (i.biblionumber=b.biblionumber)
  WHERE DATE_SUB(CURDATE(),INTERVAL 30 DAY) <= i.dateaccessioned AND m.isbn IS NOT NULL AND m.isbn != ''
  GROUP BY biblionumber
  HAVING isbn != ""
  ORDER BY rand()
  LIMIT 30
```

In this iteration of the plugin, we are using Amazon cover images, a future development would be to make the cover image fetcher configurable so we can use any data source for cover image fetching. **Coce has been added as experimental cover source feel free to test using URL https://coce.bywatersolutions.com**

Note: You can add an additional column 'localcover' - this should be blank if the biblio doesn't have a localcover and can contain any other data if it does. If this column is populated a local cover will be used. Example below:

```SQL
SELECT DISTINCT biblio.title, biblio.biblionumber, SUBSTRING_INDEX(biblioitems.isbn, ' ', 1) AS isbn, c.imagenumber AS localcover
FROM items
LEFT JOIN biblioitems USING (biblioitemnumber)
LEFT JOIN biblio ON (items.biblionumber=biblio.biblionumber)
LEFT JOIN cover_images c ON (items.biblionumber=c.biblionumber)
WHERE biblioitems.isbn IS NOT NULL AND biblioitems.isbn !=''
ORDER BY RAND()
LIMIT 15;
```

## Configure the plugin

The first option is whether to use coverimages as the links to the biblios, and whether or not to display titles under images if so.
The second option is whether to use a custom image for titles where no cover is found. THis should be a full URL to your image.
The third plugin configuration is a single text area that uses YAML ( actually, it’s JSON, whcih is a subset of YAML ) to store the configuration options. In this example it looks like this:

```YAML
---
- id: 42
  selector: "#coverflow"
  options:
  style: coverflow
- id: 42
  selector: ".coverflow_class"
  options:
  style: flat
```

In this example, we are telling the plugin to use the report with _id_ 42, and use it to create a coverflow widget to replace the HTML element with the _coverflow_ **id** (Note that the selector is quoted, as _#_ is technically a comment in YAML). The options list is passed directly to Flipster, so any options supported by Flipster can be set from the plugin configuration. `style` may be set to `'coverflow'`, `'carousel'`, `'wheel'` or `'flat'`; see the [jQuery Flipster demo](http://brokensquare.com/Code/jquery-flipster/demo/) for examples of each.

In the example, there's a second setting, that will apply to the *.coverflow_class* **class**.

The coverflow plugin now utilizes plugin helper methods to inject the necessary javascript into the opac - the plugin should remove any previously saved JS from the OpacUserJS preference.

Why do this? For speed! Rather than regenerating this code each and every time the page loads, we can generate it once, and use it over and over again.

The coverflow now uses an injected API route to build the needed code, you should not need to make any changes to the Apache configuration as in previous versions. You will need to restart plack after plugin installation in order to build the new API routes

The final step is to put your selector element somewhere in your public catalog. In this example, I put the following in the system preference OpacMainUserBlock:

```HTML
<span id="coverflow">Loading...</span>
```

Once that is in place, you need only refresh your OPAC page, and there you have it, your very own catalog coverflow widget! Not only do these coverflows look great on a computer screen, but they look great on mobile platforms as well, and are even touch responsive!

# Coverflow slider populated by a list

You can write your SQL report to access the contents of a list. In the example below, replace the shelfnumber with the ID of your chosen list:

```SQL
SELECT biblionumber, SUBSTRING_INDEX(isbn, ' ', 1) AS isbn, title
  FROM virtualshelfcontents
  LEFT JOIN biblioitems USING (biblionumber)
  LEFT JOIN biblio USING (biblionumber)
  WHERE shelfnumber=721
  ORDER BY rand()
  LIMIT 50
```

# Report with parameters
It is now possible to use reports that take input. For example,in a multibranchsystem you can setup a single report as below:

```SQL
SELECT b.biblionumber, SUBSTRING_INDEX(m.isbn, ' ', 1) AS isbn, b.title
  FROM items i
  LEFT JOIN biblioitems m USING (biblioitemnumber)
  LEFT JOIN biblio b ON (i.biblionumber=b.biblionumber)
  WHERE DATE_SUB(CURDATE(),INTERVAL 30 DAY) <= i.dateaccessioned AND m.isbn IS NOT NULL AND m.isbn != ''
  AND items.homebranch = <<Branch|branches>>
  HAVING isbn != ""
  GROUP BY biblionumber
  ORDER BY rand()
  LIMIT 30
```

Then in the plugin configuration you can use thismultiple times:

```YAML
---
- id: 42
  selector: "#coverflow1"
  params:
    - BRANCHA
  options:
    style: coverflow
- id: 42
  selector: "#coverflow2"
  params:
    - BRANCHB
  options:
    style: coverflow
```

# Troubleshooting

Did you restart plack after installation? The plugin adds files and plugin routes, currently Koha needs
a plack restart to pick these changes up. You can do it by running:

```Shell
sudo systemctl restart memcached koha-common apache2
```

Check that the API routes are listed in the spec:

```
http://koha.host.name/api/v1/.html
```

You should see:

```
GET /api/v1/contrib/coverflow/reports/{report_id}
GET /api/v1/contrib/coverflow/static/jquery-flipster/jquery.flipster.min.js
GET /api/v1/contrib/coverflow/static/jquery-flipster/jquery.flipster.min.css
```

Hit those API endpoints and ensure that you can access them.

# Build and release

This plugin uses Github actions for release, you can see the code in .github/workflows
