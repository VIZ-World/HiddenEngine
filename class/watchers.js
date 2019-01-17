#!/usr/bin/env node
"use strict";
var fs=require('fs');

function purgeCache(moduleName){
	searchCache(moduleName, function (mod){
		delete require.cache[mod.id];
	});
	Object.keys(module.constructor._pathCache).forEach(function(cacheKey){
		if (cacheKey.indexOf(moduleName)>0) {
			delete module.constructor._pathCache[cacheKey];
		}
	});
};
function searchCache(moduleName, callback){
	var mod = require.resolve(moduleName);
	if (mod && ((mod = require.cache[mod]) !== undefined)){
		(function traverse(mod) {
			mod.children.forEach(function (child){
				traverse(child);
			});
			callback(mod);
		}(mod));
	}
};
function rerequire(moduleName,callback){
	purgeCache(moduleName);
	return require(moduleName);
}
var api_http_gates=['https://rpc.viz.lexai.host/','https://solox.world/','https://rpc.viz.ropox.tools/'];
var api_gates=api_http_gates;
var gate=rerequire('viz-world-js');
function random_api_gate(){
	gate.config.set('websocket',api_gates[Math.floor(Math.random()*api_gates.length)]);
};
random_api_gate();

module.exports=class he_watchers{
	constructor(){
		global.he.json_file='./global.json';
		var _this=this;
		if(fs.existsSync(global.he.json_file)){
			var global_buf='';
			var stream=fs.createReadStream(global.he.json_file);
			stream.on('data',function(chunk){
				global_buf+=chunk;
			}).on('end', function(){
				let parse_error=false;
				try{
					global.he=JSON.parse(global_buf);
				}
				catch(e){
					parse_error=true;
				}
				if(parse_error){
					_this.create_global_json();
				}
				else{
					global.he.json_file='./global.json';
					global.he.history=[];
					global.he.watch_manager.save_global_lock=0;
					_this.start();
				}
				this.close();
			});
		}
		else{
			_this.create_global_json();
		}
	}
	create_global_json(){
		global.he.queue=[];
		global.he.queue.push();
		global.he.accounts=[];
		global.he.counters={};
		global.he.history=[];
		global.he.watch_block_id=0;
		global.he.watch_block_time=0;
		global.he.counters.accounts=0;
		global.he.counters.queue=0;
		global.he.watch_manager={'queue':1,'save_global':1,'save_global_lock':0};
		this.start();
	}
	start(){
		this.restart_queue_watch(true);
		this.save_global_watch();
		this.queue();
	}
	process_destroy(process_id){
		return new Promise(function(resolve,reject){
			global.he.watch_manager.save_global_lock=1;
			global.he.watch_manager.save_global=0;
			let global_he=global.he;
			global_he.watch_manager.save_global=0;
			global_he.watch_manager.save_global_lock=0;
			var stream=fs.createWriteStream(global_he.json_file,{flags:'w'});
			stream.on('finish',function(){
				console.log('Watchers: finished write on global.json file');
				this.close();
				setTimeout(function(){process_id.exit(0);},100);
			});
			stream.end(JSON.stringify(global_he));
		});
	}
	save_global_watch(){
		var _this=this;
		if(0==global.he.watch_manager.save_global_lock){
			if(1==global.he.watch_manager.save_global){
				let global_he=global.he;
				global_he.watch_manager.save_global=0;
				global_he.watch_manager.save_global_lock=0;
				global.he.watch_manager.save_global_lock=1;
				var stream=fs.createWriteStream(global_he.json_file,{flags:'w'});
				stream.on('finish',function(){
					global.he.watch_manager.save_global_lock=0;
					this.close();
				});
				stream.end(JSON.stringify(global_he));
			}
		}
		var stream_backup=fs.createWriteStream(global.he.json_file+'.backup',{flags:'w'});
		stream_backup.on('finish',function(){
			this.close();
		});
		stream_backup.end(JSON.stringify(global.he));
		setTimeout(function(){_this.save_global_watch()},30000);
	}
	add_history(str){
		let arr={};
		arr.t=new Date().getTime();
		arr.s=str;
		global.he.history.push(arr);
	}
	restart_queue_watch(wait){
		var _this=this;
		if(wait){
			if(0==global.he.watch_manager.queue){
				setTimeout(function(){_this.restart_queue_watch(wait)},5000);
			}
			if(1==global.he.watch_manager.queue){
				setTimeout(function(){_this.restart_queue_watch(false)},1000);
				setTimeout(function(){_this.queue_watch()},2000);
			}
			if(2==global.he.watch_manager.queue){
				setTimeout(function(){_this.restart_queue_watch(false)},1000);
			}
		}
		else{
			if(0==global.he.watch_manager.queue){
				gate.api.getDynamicGlobalProperties(function(err,result) {
					if(!err){
						global.he.watch_block_id=result.head_block_number;
						global.he.watch_manager.queue=1;
						let str='Starting VIZ Watch... on block: #'+global.he.watch_block_id;
						_this.add_history(str);
						console.log(str);
						setTimeout(function(){_this.queue_watch()},1000);
					}
				});
			}
			if(1==global.he.watch_manager.queue){
				gate.api.getDynamicGlobalProperties(function(err,result) {
					if(!err){
						global.he.watch_block_id=result.head_block_number;
						let str='Restarting VIZ Watch... on block: #'+global.he.watch_block_id;
						_this.add_history(str);
						console.log(str);
					}
				});
			}
			if(2==global.he.watch_manager.queue){
				global.he.watch_manager.queue=1;
				if(0==global.he.watch_block_id){
					global.he.watch_block_id=1;
				}
				let str='Continue VIZ Watch... on block: #'+global.he.watch_block_id;
				_this.add_history(str);
				console.log(str);
				setTimeout(function(){_this.queue_watch()},1000);
			}
		}
	}
	queue_watch(){
		if(1!=global.he.watch_manager.queue){
			let str='Stopping VIZ Watch... on block: #'+global.he.watch_block_id;
			this.add_history(str);
			console.log(str);
			this.restart_queue_watch(true);
		}
		if(1==global.he.watch_manager.queue){
			if((global.he.watch_block_time+60000)<new Date().getTime()){//60 sec delay, need reconnect
				let str='RESTARTING VIZ Watch... delayed on block: #'+global.he.watch_block_id;
				this.add_history(str);
				console.log(str);
				gate=rerequire('viz-world-js');
				random_api_gate();
			}
			var _this=this;
			gate.api.getBlock(global.he.watch_block_id,function(err,result){
				if(null!=result){
					global.he.watch_block_time=new Date().getTime();
					console.log('VIZ Watch: fetching block #'+global.he.watch_block_id);
					for(var i in result.transactions){
						for(var j in result.transactions[i].operations){
							var op_name=result.transactions[i].operations[j][0];
							var op_data=result.transactions[i].operations[j][1];
							if('comment'==op_name){
								if(''==op_data.parent_author){
									if(_this.look_in_accounts(op_data.author,2)){
										console.log('Found new post by @'+op_data.author+', apply upvote circle...');
										for(var account of global.he.accounts){
											if(2==account.type){
												if((typeof account.upvote_circle !== 'undefined')&&(1==account.upvote_circle)){
													if(typeof account.posting_key !== 'undefined'){
														var queue_item={'action':'vote','data':{'user_login':account.login,'user_posting_key':account.posting_key,'target_login':op_data.author,'target_permlink':op_data.permlink,'vote_weight':10000}};
														queue_item.id=++global.he.counters.queue;
														global.he.queue.push(queue_item);
													}
												}
											}
										}
									}
								}
							}
						}
					}
					global.he.watch_block_id=global.he.watch_block_id+1;
				}
			});
			setTimeout(function(){_this.queue_watch()},1000);
		}
	}
	look_in_accounts(login,type){
		var found=false;
		for(var m of global.he.accounts){
			if(type==m.type){
				if(login==m.login){
					found=true;
				}
			}
		}
		return found;
	}
	/*
	queue struct:
	id
	action=vote,flag,comment,witness_vote,witness_unvote
	vote
	data{
		user_login
		user_posting_key/user_active_key

		target_login
		target_permlink
		vote_weight=10000
		flag_weight=10000

		parent_author
		parent_permlink
		permlink
		title
		text
		json
	}
	*/
	queue_remove(i){
		global.he.queue.splice(i,1);
	}
	queue_resolve_error(i,err){
		let message='Error in queue #'+i;
		if(typeof err.cause !== 'undefined'){
			if(typeof err.cause.payload !== 'undefined'){
				if(typeof err.cause.payload.error.message !== 'undefined'){
					message=message+': '+err.cause.payload.error.message;
				}
			}
		}
		if(message.indexOf('You may only comment once every') !=-1){
			global.he.queue[i].time=new Date().getTime()+10000;
			global.he.queue[i].times=1;
			console.log('Delay comment in queue #'+i);
		}
		else if(message.indexOf('You may only post once every') !=-1){
			global.he.queue[i].time=new Date().getTime()+30000;
			global.he.queue[i].times=1;
			console.log('Delay post in queue #'+i);
		}
		else if(message.indexOf('You have already voted in a similar way') !=-1){
			this.queue_remove(i);
		}
		else{
			console.log(message,err);
		}
	}
	queue(){
		var _this=this;
		if(typeof global.he.queue !== 'undefined'){
			for(var i in global.he.queue){
				let current_i=i;
				let queue_execute=true;
				if(typeof global.he.queue[current_i].time !== 'undefined'){
					if(global.he.queue[current_i].time>new Date().getTime()){
						queue_execute=false;
					}
				}
				if(typeof global.he.queue[current_i].times !== 'undefined'){
					if(global.he.queue[current_i].times>10){
						_this.add_history('Removing action from queue #'+global.he.queue[current_i].id+': '+global.he.queue[current_i].action+', 10 times failed');
						_this.queue_remove(current_i);
					}
				}
				if(queue_execute){
					let queue_item_remove=false;
					console.log('Queue action #'+global.he.queue[current_i].id+': '+global.he.queue[current_i].action+', by user: '+global.he.queue[current_i].data.user_login);
					global.he.queue[current_i].time=new Date().getTime()+30000;
					if(typeof global.he.queue[current_i].times !== 'undefined'){
						global.he.queue[current_i].times++;
					}
					else{
						global.he.queue[current_i].times=1;
					}
					if('custom'==global.he.queue[current_i].action){
						if(typeof global.he.queue[current_i].data.user_active_key !== 'undefined'){
							gate.broadcast.custom(global.he.queue[current_i].data.user_active_key,[global.he.queue[current_i].data.user_login],[],global.he.queue[current_i].data.name,global.he.queue[current_i].data.data,function(err, result){if(!err){_this.queue_remove(current_i);}else{_this.queue_resolve_error(current_i,err);}});
						}
						else{
							gate.broadcast.custom(global.he.queue[current_i].data.user_posting_key,[],[global.he.queue[current_i].data.user_login],global.he.queue[current_i].data.name,global.he.queue[current_i].data.data,function(err, result){if(!err){_this.queue_remove(current_i);}else{_this.queue_resolve_error(current_i,err);}});
						}
					}
					if('vote'==global.he.queue[current_i].action){
						gate.broadcast.vote(global.he.queue[current_i].data.user_posting_key,global.he.queue[current_i].data.user_login,global.he.queue[current_i].data.target_login,global.he.queue[current_i].data.target_permlink,global.he.queue[current_i].data.vote_weight,function(err, result){if(!err){_this.queue_remove(current_i);}else{_this.queue_resolve_error(current_i,err);}});
					}
					if('witness_vote'==global.he.queue[current_i].action){
						gate.broadcast.accountWitnessVote(global.he.queue[current_i].data.user_active_key,global.he.queue[current_i].data.user_login,global.he.queue[current_i].data.target_login,true,function(err, result){if(!err){_this.queue_remove(current_i);}});
					}
					if('witness_unvote'==global.he.queue[current_i].action){
						gate.broadcast.accountWitnessVote(global.he.queue[current_i].data.user_active_key,global.he.queue[current_i].data.user_login,global.he.queue[current_i].data.target_login,false,function(err, result){if(!err){_this.queue_remove(current_i);}});
					}
				}
			}
			global.he.watch_manager.save_global=1;
		}
		setTimeout(function(){_this.queue()},1000);
	}
}
