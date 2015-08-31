Agencies = new Mongo.Collection("agencies");
CalendarDates = new Mongo.Collection("calendardates");
Calendars = new Mongo.Collection("calendars");
FareAttributes = new Mongo.Collection("fareattributes");
FareRules = new Mongo.Collection("farerules");
FeedInfos = new Mongo.Collection("feedinfos");
Frequencies = new Mongo.Collection("frequencies");
Routes = new Mongo.Collection("routes");
Shapes = new Mongo.Collection("shapes");
Stops = new Mongo.Collection("stops");
StopTimes = new Mongo.Collection("stoptimes");
Transfers = new Mongo.Collection("transfers");
Trips = new Mongo.Collection("trips");
Test = new Mongo.Collection("test");

ShapeCoordArrays = new Mongo.Collection("shapecoordarrays");
RoutesGeoJson = new Mongo.Collection("routesgeojson");

if (Meteor.isClient) {
    Meteor.startup(function () {
        var accessToken = 'pk.eyJ1IjoiYmxhc3Rlcm50IiwiYSI6ImlwalZmdUkifQ.TJCtxxyNmRhvH-17afmGng';
        var format = '.png'; //'@2x.png';
        
        var map = new ol.Map({
            renderer: 'canvas',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'http://api.tiles.mapbox.com/v4/blasternt.gbkpm0gd/{z}/{x}/{y}' + format + '?access_token=' + accessToken,
                        crossOrigin: 'anonymous'
                    })
                })
              ],
            interactions: ol.interaction.defaults().extend([
                new ol.interaction.DragRotateAndZoom()
            ]),
            target: 'map',
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });
        
        var geoJson = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857'
                }
            },
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [0, 0]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [[4e6, -2e6], [8e6, 2e6]]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [[4e8, 2e6], [8e6, -2e6]]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'MultiLineString',
                        'coordinates': [
                            [[-1e6, -7.5e5], [-1e6, 7.5e5]],
                            [[1e6, -7.5e5], [1e6, 7.5e5]],
                            [[-7.5e5, -1e6], [7.5e5, -1e6]],
                            [[-7.5e5, 1e6], [7.5e5, 1e6]]
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'MultiPolygon',
                        'coordinates': [
                            [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
                            [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6], [0, 6e6]]],
                            [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
                        ]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'GeometryCollection',
                        'geometries': [
                            {
                                'type': 'LineString',
                                'coordinates': [[-5e6, -5e6], [0, -5e6]]
                            },
                            {
                                'type': 'Point',
                                'coordinates': [4e6, -5e6]
                            },
                            {
                                'type': 'Polygon',
                                'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
                            }
                        ]
                    }
                }
            ]
        };
        
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            })
        });

        var routeSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geoJson)
        });
        var routeVector = new ol.layer.Vector({
            source: routeSource,
            style: style
        });
        //map.addLayer(routeVector);

        var stopSource = new ol.source.Vector({});
        var stopVector = new ol.layer.Vector({
            source: stopSource
        });
        map.addLayer(stopVector);

        var agenciesCursor = Agencies.find({});
        agenciesCursor.observe({
            added: function (doc) {
                addAgency(doc);
            },
            changed: function (nDoc, oDoc) {
                //updateAgency(nDoc);
            },
            removed: function (doc) {
                //removeAgency(doc);
            }
        });

        function addAgency(agency) {
            //console.log(agency);

            var agency_id = agency.agency_id;
            if (agency_id != null) {
                var routesCursor = Routes.find({
                    agency_id: agency_id
                });
                routesCursor.observe({
                    added: function (doc) {
                        addRoute(doc);
                    },
                    changed: function (nDoc, oDoc) {
                        //updateRoute(nDoc);
                    },
                    removed: function (doc) {
                        //removeRoute(doc);
                    }
                });
            } else {
                console.error("error parsing agency", agency);
            }
        }

        function addRoute(route) {
            console.log(route);
            console.log(route.geoJson);

            var route_id = route.route_id;
            
            var geoJson = route.geoJson;

            if (route.route_color == null) {
                route.route_color = "#FFFFFF";
            }
            
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: route.route_color,
                    lineDash: [4],
                    width: 3
                })
            });

            var routeSource = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geoJson)
            });
            var routeVector = new ol.layer.Vector({
                source: routeSource,
                style: style
            });
            map.addLayer(routeVector);

            //            tripsCursor.observe({
            //                added: function (doc) {
            //                    addTrip(doc, route, routeGeoJson);
            //                },
            //                changed: function (nDoc, oDoc) {
            //                    //updateTrip(nDoc);
            //                },
            //                removed: function (doc) {
            //                    //removeTrip(doc);
            //                }
            //            });
            //            var tripSelector = Trips.find({
            //                route_id: route_id,
            //                service_id: "WKDY",
            //                shape_id: {
            //                    $exists: true
            //                }
            //            }, { limit: 1 });
            //            tripSelector.forEach(function (trip) {
            //                addTrip(trip, route, routeSource);
            //            });
        }

        //        function addTrip(trip, route, routeSource) {
        //            console.log(trip);
        //            var shape_id = trip.shape_id;
        //            var coordCache = ShapeCoordArrays.findOne({
        //                shape_id: shape_id
        //            });
        //
        //            tripLine = new ol.geom.LineString(coordCache.coordArray, 'XY');
        //            tripLine.transform('EPSG:4326', 'EPSG:3857');
        //            
        //            console.log(tripLine);
        //            
        //            var feature = new ol.Feature(tripLine);
        //            routeSource.addFeature(feature);
        //        }

        var stopsCursor = Stops.find({});
        stopsCursor.observe({
            added: function (doc) {
                addStop(doc);
            },
            changed: function (nDoc, oDoc) {
                //updateStop(nDoc);
            },
            removed: function (doc) {
                //removeStop(doc);
            }
        });

        function addStop(stop) {
            var x;
            var y;
            if (stop.stop_lon != null) {
                x = parseFloat(stop.stop_lon);
            } else {
                console.error("error parsing lon: ", stop);
            }

            if (stop.stop_lat != null) {
                y = parseFloat(stop.stop_lat);
            } else {
                console.error("error parsing lat: ", stop);
            }

            if (x && y) {
                var geom = new ol.geom.Point(ol.proj.transform([x, y], 'EPSG:4326', 'EPSG:3857'));
                var feature = new ol.Feature(geom);
                stopSource.addFeature(feature);
            } else {
                console.error("lat lon values corrupted: ", stop);
            }

        }

        //        var imageStyle = new ol.style.Circle({
        //            radius: 5,
        //            snapToPixel: false,
        //            fill: new ol.style.Fill({
        //                color: 'yellow'
        //            }),
        //            stroke: new ol.style.Stroke({
        //                color: 'red',
        //                width: 1
        //            })
        //        });
        //
        //        var headInnerImageStyle = new ol.style.Style({
        //            image: new ol.style.Circle({
        //                radius: 2,
        //                snapToPixel: false,
        //                fill: new ol.style.Fill({
        //                    color: 'blue'
        //                })
        //            })
        //        });
        //
        //        var headOuterImageStyle = new ol.style.Circle({
        //            radius: 5,
        //            snapToPixel: false,
        //            fill: new ol.style.Fill({
        //                color: 'black'
        //            })
        //        });
        //
        //        var n = 1;
        //        var omegaTheta = 30000; // Rotation period in ms
        //        var R = 7e6;
        //        var r = 2e6;
        //        var p = 2e6;
        //        map.on('postcompose', function (event) {
        //            var vectorContext = event.vectorContext;
        //            var frameState = event.frameState;
        //            var theta = 2 * Math.PI * frameState.time / omegaTheta;
        //            var coordinates = [];
        //            var i;
        //            for (i = 0; i < n; ++i) {
        //                var t = theta + 2 * Math.PI * i / n;
        //                var x = (R + r) * Math.cos(t) + p * Math.cos((R + r) * t / r);
        //                var y = (R + r) * Math.sin(t) + p * Math.sin((R + r) * t / r);
        //                coordinates.push([x, y]);
        //            }
        //            vectorContext.setImageStyle(imageStyle);
        //            vectorContext.drawMultiPointGeometry(
        //                new ol.geom.MultiPoint(coordinates), null);
        //
        //            var headPoint = new ol.geom.Point(coordinates[coordinates.length - 1]);
        //            var headFeature = new ol.Feature(headPoint);
        //            vectorContext.drawFeature(headFeature, headInnerImageStyle);
        //
        //            vectorContext.setImageStyle(headOuterImageStyle);
        //            vectorContext.drawMultiPointGeometry(headPoint, null);
        //
        //            map.render();
        //        });

        map.render();
    });
}

if (Meteor.isServer) {
    //ShapeCoordArrays.remove({});
    var GTFS = Meteor.npmRequire('gtfs');

    Meteor.startup(function () {
        var agenciesCursor = Agencies.find({});
        agenciesCursor.observe({
            added: function (doc) {
                addAgency(doc);
            },
            changed: function (nDoc, oDoc) {
                //updateAgency(nDoc);
            },
            removed: function (doc) {
                //removeAgency(doc);
            }
        });

        function addAgency(agency) {
            //console.log(agency);

            var agency_id = agency.agency_id;
            if (agency_id != null) {
                var routesCursor = Routes.find({
                    agency_id: agency_id
                });
                routesCursor.observe({
                    added: function (doc) {
                        addRoute(doc);
                    },
                    changed: function (nDoc, oDoc) {
                        //updateRoute(nDoc);
                    },
                    removed: function (doc) {
                        //removeRoute(doc);
                    }
                });
            } else {
                console.error("error parsing agency", agency);
            }
        }

        function addRoute(route) {
            console.log(route);

            var route_id = route.route_id;

            if (route.route_color == null) {
                route.route_color = "#FFFFFF";
            }

            //            var routeSource = new ol.source.Vector({});
            var routeSource = null;
            //            var routeVector = new ol.layer.Vector({
            //                source: routeSource
            //            });
            //            map.addLayer(routeVector);

            var tripsCursor = Trips.find({
                route_id: route_id,
                service_id: "WKDY",
                shape_id: {
                    $exists: true
                }
            }, {
                limit: 1
            });

            var routeGeoJson = {
                "type": "FeatureCollection",
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:3857'
                    }
                },
                "features": []
            }

            //            tripsCursor.observe({
            //                added: function (doc) {
            //                    addTrip(doc, route, routeGeoJson);
            //                },
            //                changed: function (nDoc, oDoc) {
            //                    //updateTrip(nDoc);
            //                },
            //                removed: function (doc) {
            //                    //removeTrip(doc);
            //                }
            //            });
            tripsCursor.forEach(function (trip) {
                addTrip(trip, route, routeGeoJson);
            });
            Routes.update({
                route_id: route_id
            }, {
                $set: {
                    geoJson: routeGeoJson
                }
            }, {
                upsert: true
            });
        }

        function addTrip(trip, route, routeGeoJson) {
            var shape_id = trip.shape_id;
            var coordCache = ShapeCoordArrays.findOne({
                shape_id: shape_id
            });
            if (coordCache == null) {
                shapeCursor = Shapes.find({
                    shape_id: shape_id
                }, {
                    sort: {
                        shape_pt_sequence: 1
                    }
                });

                shapeCursor.forEach(function (shape) {
                    var shape_id = shape.shape_id;
                    ShapeCoordArrays.update({
                        shape_id: shape_id
                    }, {
                        $set: {
                            shape_id: shape_id
                        },
                        $push: {
                            coordArray: [parseFloat(shape.shape_pt_lon), parseFloat(shape.shape_pt_lat)]
                        }
                    }, {
                        upsert: true
                    });
                });
            }

            coordCache = ShapeCoordArrays.findOne({
                shape_id: shape_id
            });

            var lineString = {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": coordCache.coordArray
                },
                "properties": {
                    "shape_id": shape_id
                }
            };

            routeGeoJson["features"] = [lineString];
        }
    });
}