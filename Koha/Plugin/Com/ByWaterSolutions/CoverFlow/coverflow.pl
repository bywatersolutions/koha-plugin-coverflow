#!/usr/bin/perl

use Modern::Perl;

use C4::Context;
use lib C4::Context->config("pluginsdir");

use Koha::Plugin::Com::ByWaterSolutions::CoverFlow;

use CGI;

my $cgi = new CGI;

my $coverflow = Koha::Plugin::Com::ByWaterSolutions::CoverFlow->new({ cgi => $cgi });
$coverflow->run_report();
