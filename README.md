node-red-node-harperdb
========================
A <a href="http://nodered.org" target="_new">Node-RED</a> node to read and write to HarperDB.

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

 npm install node-red-contrib-harperdb


Usage
-----

Execute Operations against HarperDB see <a href="http://docs.harperdb.io">docs.harperdb.io for more info. 
**Inputs**

 **insert**
 
  **schema** HarperDB schema where you want to insert. 
  **table** HarperDB table where you want to insert. 


 

 **update**
 
  **schema** HarperDB schema where you want to update. 
  **table** HarperDB table where you want to  update. 
 


 **delete**
 
  **schema** HarperDB schema where you want to delete. 
  **table** HarperDB table where you want to delete. 
  **hash_attribute** The hash_attribute as defined in **msg.payload** from which you wish to delete in HarperDB

 




 **search_by_value**
 
  **schema** HarperDB schema where you want to search. 
  **table** HarperDB table where you want to search. 
  **hash_attribute** The hash_attribute as defined in HarperDB for your schema.table. 
  **search_attribute** The attribute in HarperDB that you wish to search/filter. 
  **search_value** The attribute in your **msg.payload** that you wish use to search/filter the search_attribute For example **msg.payload.search_value** 
  **get_attributes** The attributes you want returned in your response.  If using multiple values seperate with a comma For example ** id, breed, age **.  

 
**search_by_hash**
 
  **schema** HarperDB schema where you want to search. 
  **table** HarperDB table where you want to search. 
  **hash_attribute** The hash_attribute as defined in HarperDB for your schema.table. 
  **hash_values** Where the values you wish to search/filter the hash_attribute on live in your **msg.payload**  so for example **msg.payload.hash_values **
  **get_attributes** The attributes you want returned in your response.  If using multiple values seperate with a comma For example ** id, breed, age **.  

 
 **SQL**
 
 Make sure your *msg.payload* has a parameter on it called sql.  For example *{msg.payload.sql = "select * from dog" }*
 