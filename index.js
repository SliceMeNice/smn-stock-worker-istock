var bodyParser = require( 'body-parser' );
var express = require( 'express' );
var nconf = require( 'nconf' );
var Q = require( 'q' );


nconf
	.argv()
	.env();

var config = nconf;

var stock = require( './lib/stock.js' )( config );
var IstockAssetCrawler = require( './lib/istockAssetCrawler.js' );

var app = express();
app.use( bodyParser.json() );


app.post( '/go', function ( req, res ) {
	var message = req.body;

	switch ( message.type ) {
		case 'import':

			var asset = message.asset;

			switch ( asset.type ) {
				case 'iStock':
					importIstockAssetData( asset.istockId ).then(
						function () {
							res.sendStatus( 200 );
						},
						function () {
							res.sendStatus( 500 );
						}
					);
					break;
			}

			break;

		default:
			res.sendStatus( 500 );
	}
} );

var server = app.listen( process.env.PORT, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log( 'Example app listening at http://%s:%s', host, port )

} );


function importIstockAssetData( istockId ) {
	var deferred = Q.defer();

	var crawler = new IstockAssetCrawler();

	crawler.collectData( istockId ).then(
		function ( assetData ) {
			console.log( assetData );

			putAssetIntoStock( assetData ).then(
				function () {
					console.log( 'Done!' );
					deferred.resolve();
				},
				function () {
					console.log( 'Failed! :(' );
					deferred.reject();
				}
			);
		},
		function () {
			// TODO: log
			deferred.reject();
		}
	);

	return deferred.promise;
}

function putAssetIntoStock( assetData ) {
	var deferred = Q.defer();

	stock.findOrCreateAsset( assetData ).then(
		function ( asset ) {

			var tagPromises = [];

			assetData.tags.forEach( function ( tagName ) {

				var promise = stock.findOrCreateTag( tagName ).then(
					function ( tag ) {

						stock.addTagToAsset( tag, asset ).fail( function ( response ) {
							// TODO: log
						} );

					},
					function ( response ) {
						// TODO: log
					}
				);

				tagPromises.push( promise );
			} );

			Q.allSettled( tagPromises ).then( function () {
				deferred.resolve();
			} );

		},
		function ( response ) {
			// TODO: log
			deferred.reject();
		}
	);

	return deferred.promise;
}
