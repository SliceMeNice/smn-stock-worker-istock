var bodyParser = require( 'body-parser' );
var config = require( 'nconf' );
var express = require( 'express' );
var Q = require( 'q' );

config.argv().env();

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
					collectIstockAssetData( asset.istockId ).then(
						function ( assetData ) {
							putAssetDataInImporterQueue( assetData ).then(
								function () {
									res.sendStatus( 200 );
								},
								function () {
									res.sendStatus( 500 );
								}
							)
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


function collectIstockAssetData( istockId ) {
	var deferred = Q.defer();

	var crawler = new IstockAssetCrawler();

	crawler.collectData( istockId ).then(
		function ( assetData ) {
			deferred.resolve( assetData );
		},
		function () {
			// TODO: log
			deferred.reject();
		}
	);

	return deferred.promise;
}

function putAssetDataInImporterQueue( assetData ) {
	var deferred = Q.defer();

	sendSqsMessage( JSON.stringify( assetData ) ).then(
		function () {
			deferred.resolve();
		},
		function () {
			deferred.reject();
		}
	);

	return deferred.promise;
}

function sendSqsMessage( messageBody ) {
	var deferred = Q.defer();

	AWS.config.update( {
		accessKeyId:     config.get( 'AWS_ACCESS_KEY_ID' ),
		secretAccessKey: config.get( 'AWS_SECRET_KEY' ),
		region:          config.get( 'AWS_IMPORTER_QUEUE_REGION' )
	} );

	var sqs = new AWS.SQS();

	var params = {
		MessageBody:  messageBody || '',
		QueueUrl:     config.get( 'AWS_IMPORTER_QUEUE_URL' ),
		DelaySeconds: 0
	};

	sqs.sendMessage( params, function ( err, data ) {
		if ( err ) {
			console.log( err, err.stack );
			deferred.reject( err );
		} // an error occurred
		else {
			console.log( 'Message sent to SQS: ' + params.MessageBody );
			deferred.resolve();
		}
	} );

	return deferred.promise;
}
