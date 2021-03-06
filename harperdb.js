module.exports = function(RED) {
  'use strict';
  const request = require('request');

  function HarperDBSetupNode(n) {
    RED.nodes.createNode(this, n);
    this.hostname = n.hostname;
    this.port = n.port;
    this.name = n.name;
    var node = this;

    function getOptions() {
      if (node.hostname.indexOf('http') < 0) {
        node.hostname = 'http://' + node.hostname;
      }

      let url = node.hostname;
      if(node.port)
        url = url + ':' + node.port;

      var options = {
        method: 'POST', url: url, headers: {
          'cache-control': 'no-cache',
          authorization: 'Basic ' + new Buffer(node.credentials.user + ':' + node.credentials.password).toString('base64'),
          'content-type': 'application/json',
        }, body: {}, json: true,
      };

      return options;

    };

    this.options = getOptions();

  }

  RED.nodes.registerType('harperdb setup', HarperDBSetupNode, {
    credentials: {
      user: { type: 'text' }, password: { type: 'password' },
    },
  });

  function HarperDBNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    var schema = n.schema;
    var table = n.table;
    this.HarperDBConfig = RED.nodes.getNode(n.harperdb);

    node.on('input', function(msg) {

      let options = this.HarperDBConfig.options;

      let hdb_payload = {
        operation: n.operation,
      };

      if (schema) {
        hdb_payload.schema = schema;
      }

      if (table) {
        hdb_payload.table = table;
      }

      if (n.get_attributes) {
        hdb_payload.get_attributes = n.get_attributes.split(',').map(el => el.trim());
      }

      if (n.operation === 'search_by_hash') {
        let hash_values = [];
        if (Array.isArray(msg.payload[n.hash_values])) hash_values = msg.payload[n.hash_values]; else hash_values = [msg.payload[n.hash_values]];
        hdb_payload.hash_values = hash_values;

      } else if (n.operation === 'search_by_value') {
        hdb_payload.search_attribute = n.search_attribute;
        hdb_payload.search_value = msg.payload[n.search_value];
      } else if (n.operation === 'sql') {
        //console.log('n.input_sql  : ' + n.sql);
        if (n.sql === 'msg.payload.sql') {
          //console.log('msg.payload.sql  : ' + msg.payload.sql);
          hdb_payload.sql = msg.payload.sql;
        } else if (n.sql === 'msg.topic') {
          //console.log('msg.topic  : ' + msg.topic);
          hdb_payload.sql = msg.topic;
        } else if (n.sql === 'fixed_statement') {
          //console.log('n.fixed_statement  : ' + n.fixed_statement);
          hdb_payload.sql = n.fixed_statement;
        }

      } else if (n.operation === 'update' || n.operation === 'insert') {
        let records = [];
        if (Array.isArray(msg.payload)) {
          records = msg.payload;
        } else {
          records = [msg.payload];
        }

        hdb_payload.records = records;

      } else if (n.operation === 'delete') {
        if (Array.isArray(msg.payload)) {
          hdb_payload.hash_values = msg.payload;
        } else {
          hdb_payload.hash_values = [msg.payload];
        }
      }

      options.body = hdb_payload;

      //console.log('options' + JSON.stringify(options));
      node.status({ fill: 'blue', shape: 'dot', text: 'requesting' });
      request(options, function(error, response, body) {
        if (error || body.error) {
          if (error) {
            node.error(error, msg);
          } else {
            node.error(body.error);
          }

          node.status({ fill: 'red', shape: 'ring', text: 'Error' });

        } else {
          msg.payload = body;
          node.send(msg);
          node.status({});
        }

      });

    });
  }

  RED.nodes.registerType('harperdb', HarperDBNode);

};
