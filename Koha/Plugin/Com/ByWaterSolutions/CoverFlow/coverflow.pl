#!/usr/bin/perl

use Modern::Perl;

use FindBin;                 # locate this script
use lib "$FindBin::Bin/../../../../../";  # use the parent directory

use Koha::Plugin::Com::ByWaterSolutions::CoverFlow;

use CGI;

my $cgi = new CGI;

my $coverflow = Koha::Plugin::Com::ByWaterSolutions::CoverFlow->new({ cgi => $cgi });
$coverflow->report();
