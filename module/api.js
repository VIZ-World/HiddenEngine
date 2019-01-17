#!/usr/bin/env node
"use strict";

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

module.exports=class he_module{
	constructor(obj){
		let _this=this;
		return new Promise(function(resolve,reject){
			_this.content=obj.content;
			_this.replace=obj.replace;
			_this.session=obj.session;
			_this.path_array=obj.path_array;
			_this._GET=obj._GET;
			_this._POST=obj._POST;
			_this.cookies=obj.cookies;
			_this.response=obj.response;
			resolve(_this.exec());
		});
	}
	exec(){
		let _this=this;
		return new Promise(function(resolve,reject){
			let test_api_key=_this.path_array[2];
			if(''!=test_api_key){
				_this.content='';
				_this.session.change_template='clear.tpl';
				let api_account={};
				let find_api_account=false;
				for(var m of global.he.accounts){
					if(m.api_key==test_api_key){
						api_account=m;
						find_api_account=true;
						break;
					}
				}
				if(find_api_account){
					if(typeof _this._POST.method !== 'undefined'){
						var api_error=false;
						if('comment'==_this._POST.method){
							/*
							struct:
							comment{
								action_login (for delegated access)
								action_delay (for delayed actions)
								parent_author
								parent_permlink
								permlink
								title
								text
								json
							}
							*/
							let action_login=api_account.login;
							if(typeof _this._POST.action_login !== 'undefined'){
								action_login=_this._POST.action_login;
							}
							var queue_item={'action':'comment','data':{'user_login':action_login,'user_posting_key':api_account.posting_key,'parent_author':_this._POST.parent_author,'parent_permlink':_this._POST.parent_permlink,'permlink':_this._POST.permlink,'title':_this._POST.title,'text':_this._POST.text,'json':_this._POST.json}};
							if(typeof _this._POST.action_delay !== 'undefined'){
								if(parseInt(_this._POST.action_delay)>0){
									queue_item.time=new Date().getTime() + (parseInt(_this._POST.action_delay)*1000);
								}
							}
							queue_item.id=++global.he.counters.queue;
							global.he.queue.push(queue_item);
						}
						if('custom'==_this._POST.method){
							/*
							struct:
							custom_json{
								action_login (for delegated access)
								action_delay (for delayed actions)
								action_active_key (for use active key)
								name
								data
							}
							*/
							let action_login=api_account.login;
							if(typeof _this._POST.action_login !== 'undefined'){
								action_login=_this._POST.action_login;
							}
							if(typeof _this._POST.action_active_key !== 'undefined'){
								var queue_item={'action':'custom_json','data':{'user_login':action_login,'user_active_key':api_account.active_key,'name':_this._POST.name,'data':_this._POST.data}};
							}
							else{
								var queue_item={'action':'custom_json','data':{'user_login':action_login,'user_posting_key':api_account.posting_key,'name':_this._POST.name,'data':_this._POST.data}};
							}
							if(typeof _this._POST.action_delay !== 'undefined'){
								if(parseInt(_this._POST.action_delay)>0){
									queue_item.time=new Date().getTime() + (parseInt(_this._POST.action_delay)*1000);
								}
							}
							queue_item.id=++global.he.counters.queue;
							global.he.queue.push(queue_item);
						}
						if('vote'==_this._POST.method){
							let action_login=api_account.login;
							if(typeof _this._POST.action_login !== 'undefined'){
								action_login=_this._POST.action_login;
							}
							var queue_item={'action':'vote','data':{'user_login':action_login,'user_posting_key':api_account.posting_key,'target_login':_this._POST.target_login,'target_permlink':_this._POST.target_permlink,'vote_weight':parseInt(_this._POST.vote_weight)}};
							if(typeof _this._POST.action_delay !== 'undefined'){
								if(parseInt(_this._POST.action_delay)>0){
									queue_item.time=new Date().getTime() + (parseInt(_this._POST.action_delay)*1000);
								}
							}
							queue_item.id=++global.he.counters.queue;
							global.he.queue.push(queue_item);
						}
						if('reg'==_this._POST.method){
							api_error=true;
							if(typeof _this._POST.login !== 'undefined'){
								if(typeof _this._POST.owner !== 'undefined'){
									var target_login=_this._POST.login;
									var target_owner=_this._POST.owner;
									var owner={
											'weight_threshold': 1,
											'account_auths': [],
											'key_auths': [
												[target_owner, 1]
											]
										};
									var target_active=_this._POST.active;
									var active={
											'weight_threshold': 1,
											'account_auths': [],
											'key_auths': [
												[target_active, 1]
											]
										};
									var target_posting=_this._POST.posting;
									var posting={
											'weight_threshold': 1,
											'account_auths': [],
											'key_auths': [
												[target_posting, 1]
											]
										};
									var target_memo=_this._POST.memo;
									var target_name='';
									if(typeof _this._POST.name !== 'undefined'){
										target_name=_this._POST.name;
									}
									var target_about='';
									if(typeof _this._POST.about !== 'undefined'){
										target_about=_this._POST.about;
									}
									var target_location='';
									if(typeof _this._POST.location !== 'undefined'){
										target_location=_this._POST.location;
									}
									var metadata={};
									metadata.profile={};
									metadata.profile.name=target_name;
									metadata.profile.about=target_about;
									metadata.profile.location=target_location;
									let action_login=api_account.login;
									if(typeof _this._POST.action_login !== 'undefined'){
										action_login=_this._POST.action_login;
									}
									let creation_fee='';
									if(typeof _this._POST.creation_fee !== 'undefined'){
                                                creation_fee=_this._POST.creation_fee;
                                    }
									if(''==creation_fee){
										creation_fee='5.000 VIZ';
									}
									gate.broadcast.accountCreate(api_account.active_key,creation_fee,action_login,target_login,owner,active,posting,target_memo,JSON.stringify(metadata),function(err, result){
										if(!err){
											console.log('API reg success, login: '+target_login+', creator: '+api_account.login);
											api_error=false;
										}
										else{
											console.log(err);
										}
									});
								}
							}
						}
						if(api_error){
							_this.content+='ERROR '+api_account.login+' '+_this._POST.method;
						}
						else{
							_this.content+='OK '+api_account.login+' '+_this._POST.method;
						}
					}
					else{
						_this.content+='OK '+api_account.login;
					}
				}
				else{
					_this.content+='ERROR';
				}
			}
			resolve({
				'content':_this.content,
				'replace':_this.replace,
				'session':_this.session,
				'response':_this.response,
				'path_array':_this.path_array,
				'_GET':_this._GET,
				'_POST':_this._POST,
				'cookies':_this.cookies,
			});
		});
	}
}
