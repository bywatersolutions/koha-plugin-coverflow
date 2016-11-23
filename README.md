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

Once the plugin is installed, the steps to get your coverflow to show up are as follows:

First, you need to create one or more public reports for your coverflow widget or widgets to be based on. This is how the plugin knows what the content of your widget should contain. Each report needs only three columns; title, biblionumber, and isbn. It is important that you have a good and valid isbn, as that is the datum used to actually fetch the cover. In the iteration of the plugin, we are using Amazon cover images, but I believe in the end I will make the cover image fetcher configurable so we can use any data source for cover image fetching.

Note: You can add an additional column 'localcover' - this should be blank if the biblio doesn't have a localcover and can contain any other data if it does. If this column is populated a local cover will be used.

Second, we need to configure the plugin. 
The first option is whether to use coverimages as the links to the biblios, and whether or not to display titles under images if so.
The second option is whether to use a custom image for titles where no cover is found. THis should be a full URL to your image.
The third plugin configuration is a single text area that uses YAML ( actually, it’s JSON, whcih is a subset of YAML ) to store the configuration options. In this example it looks like this:

```
- id: 42
  selector: #coverflow
  options:
  style: coverflow
```

In this example, we are telling the plugin to use the report with id 42, and use it to create a coverflow widget to replace the HTML element with the id “coverflow”. The options list is passed directly to Flipster, so any options supported by Flipster can be set from the plugin configuration! In fact, in addition to the traditional coverflow, Flipster has a “carousel” mode which is a much more compact version of the coverflow. You can also configure which cover the widget will start on, among other options.

At the time the plugins options are saved or updated, the plugin will then generate some minified JavaScript code that is automatically stored in the Koha system preference OpacUserJS. Here is an example of the output:

```
/* JS for Koha CoverFlow Plugin 
 This JS was added automatically by installing the CoverFlow plugin
 Please do not modify */$(document).ready(function(){$.getScript("/plugin/Koha/Plugin/Com/ByWaterSolutions/CoverFlow/jquery-flipster/src/js/jquery.flipster.min.js",function(data,textStatus,jqxhr){$("head").append("<link id='flipster-css' href='/plugin/Koha/Plugin/Com/ByWaterSolutions/CoverFlow/jquery-flipster/src/css/jquery.flipster.min.css' type='text/css' rel='stylesheet' />");$('#coverflow').load("/coverflow.pl?id=42",function(){var opt={'items':'.item','minfactor':15,'distribution':1.5,'scalethreshold':0,'staticbelowthreshold':false,'titleclass':'itemTitle','selectedclass':'selectedItem','scrollactive':true,'step':{'limit':4,'width':10,'scale':true}};$('#coverflow').flipster({style:'coverflow',});});});});
/* End of JS for Koha CoverFlow Plugin */
```

Why do this? For speed! Rather than regenerating this code each and every time the page loads, we can generate it once, and use it over and over again.

If you inspect the code closely, you’ll notice it references a script “coverflow.pl”. This is a script that is included with the coverflow plugin. Since we need to access this from the OPAC ( and we don’t want to set off any XSS attack alarms ), we need to modify the web server configuration for the public catalog and add the followup to it:

```
ScriptAlias /coverflow.pl "/var/lib/koha/mykoha/plugins/Koha/Plugin/Com/ByWaterSolutions/CoverFlow/coverflow.pl"
Alias /plugin "/var/lib/koha/mykoha/plugins"
# The stanza below is needed for Apache 2.4+
<Directory /var/lib/koha/mykoha/plugins>
      Options Indexes FollowSymLinks
      AllowOverride None
      Require all granted
</Directory>
```

This line gives us access to the coverflow.pl script from the OPAC. This script retrieves the report data and passes it back to the public catalog for creating the coverflow widget. Koha::Cache is supported in order to make the widget load as quickly as possible!

The final step is to put your selector element somewhere in your public catalog. In this example, I put the following in the system preference OpacMainUserBlock:

```
<span id="coverflow">Loading...</span>
```

Once that is in place, you need only refresh your OPAC page, and there you have it, your very own catalog coverflow widget! Not only do these coverflows look great on a computer screen, but they look great on mobile platforms as well, and are even touch responsive!
