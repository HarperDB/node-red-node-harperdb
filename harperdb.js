module.exports = function (RED) {
    "use strict";
    const http = require("http");


    function HarperDBSetupNode(n) {
        RED.nodes.createNode(this, n);
        this.hostname = n.hostname;
        this.port = n.port;
        this.name = n.name;
        var node = this;

        function getOptions() {

            var options = {
                "method": "POST",
                "hostname": node.hostname,
                "port": node.port,
                "path": "/",
                "headers": {
                    "content-type": "application/json",
                    "authorization":
                    "Basic " +
                    new Buffer(node.credentials.user + ":" + node.credentials.password).toString(
                        "base64"
                    )

                }
            };


            return options;

        };

        this.options = getOptions();


    }

    RED.nodes.registerType("harperdb setup", HarperDBSetupNode, {
        credentials: {
            user: {type: "text"},
            password: {type: "password"}
        }
    });


    function HarperDBNode(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var schema = n.schema;
        var table = n.table;
        this.HarperDBConfig = RED.nodes.getNode(n.harperdb);



        node.on("input", function (msg) {


            var req = http.request(this.HarperDBConfig.options, function (res) {

                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function () {
                        var body = Buffer.concat(chunks);
                        if (body.error) {
                            node.error(body.error, msg);
                        } else {
                            msg.payload = body;
                            node.send(msg);
                        }
                    });


            });


            req.on('error', function (error) {
                console.log(error);
                node.error(error,msg);
                node.status({fill:"red",shape:"ring",text:"Error"});

            });


            let hdb_payload = {
                operation: n.operation
            };

            if (schema) {
                hdb_payload.schema = schema;
            }

            if (table) {
                hdb_payload.table = table;
            }

            if (n.hash_attribute) {
                hdb_payload.hash_attribute = n.hash_attribute;
            }

            if (n.get_attributes) {
                hdb_payload.get_attributes = n.get_attributes;
            }


            if (n.operation === 'search_by_hash') {
                let hash_values = [];
                if (Array.isArray(msg.payload[n.hash_values]))
                    hash_values = msg.payload[n.hash_values];
                else
                    hash_values = [msg.payload[n.hash_values]];
                hdb_payload.hash_values = hash_values;

            } else if (n.operation === 'search_by_value') {
                hdb_payload.search_attribute = n.search_attribute;
                hdb_payload.search_value = msg.payload[n.search_value];
            } else if (n.operation === 'sql') {
                hdb_payload.sql = msg.payload.sql;

            } else if (n.operation === 'update' || n.operation === 'insert') {
                let records = [];
                if (Array.isArray(msg.payload)) {
                    records = msg.payload;
                } else {
                    records = [msg.payload];
                }

                hdb_payload.records = records;

            } else if (n.operation === 'delete') {
                let hash_values = [];
                if (Array.isArray(msg.payload)) {
                    for (let item in msg.payload) {
                        hash_values.push(msg.payload[item][n.hash_attribute]);
                    }
                } else {
                    hash_values = msg.payload[n.hash_attribute];
                }

                hdb_payload.hash_values = hash_values;

            }



            req.write(JSON.stringify(hdb_payload));


            req.end();


        });
    }

    RED.nodes.registerType("harperdb", HarperDBNode);


}
