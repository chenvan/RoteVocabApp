var AsyncStorage = require('react-native').AsyncStorage;
var ToastAndroid = require('react-native').ToastAndroid;
var Alert = require('react-native').Alert;

var Promise = require("bluebird");
/*
rvDB
|——dbNameCollection: object -> {dbItem1: coverImageUrl, dbItem2: coverImageUrl, ...}
|——dbItem1: object -> {lastContentsLocation: string, bookmark:{lastTime: string(when compare, should change to Date object), lastIndex: number},rows:array}
|——dbItem2: object -> ...
|——...
*/

var rvDB = {

	getDbNameCollection : function(){
		return AsyncStorage.getItem('dbNameCollection').then((value)=>{

			//if first time use app, init database
			if(value == null){
				return AsyncStorage.setItem('dbNameCollection',
					JSON.stringify({'软件说明':'','用法':'','示例词集':'','长按词集会进入整理页面':''})).then(()=>{

					return Promise.all([
							AsyncStorage.setItem('软件说明',JSON.stringify(
								{
									totalLength: 2,
									lastContentsLocation: Number.MAX_SAFE_INTEGER,
									bookmark: {lastTime: new Date(), lastIndex:0},
									rows: [
											{item: '透析记词辅助你更好地使用透析法学习英文'},
											{item: '想了解透析法，请退回都主页，点击菜单按钮，再点击软件用法。该文章有透析法相关的链接'}
									]
								}
							)),
							AsyncStorage.setItem('用法',JSON.stringify(
								{
									totalLength: 5,
									lastContentsLocation: Number.MAX_SAFE_INTEGER,
									bookmark: {lastTime: new Date(), lastIndex:0},
									rows: [
										{item: '把阅读类APP高亮的英文导出到txt文档\n注意：txt文档中的每一条高亮都需要有双引号包住'},
										{item: '在透析记词里，把上述的txt文档导入进来'},
										{item: '复习前，先打开能捕获剪贴板的词典'},
										{item: '复习时，轻点生词，这样该单词就会自动复制到剪贴板。随后，词典APP自动弹出解释'},
										{item: '想了解更多操作，请退回到主页，点击菜单按钮，再点击软件用法'}
									]
								}
							)),
							AsyncStorage.setItem('示例词集',JSON.stringify(
								{
									totalLength: 3,
									lastContentsLocation: Number.MAX_SAFE_INTEGER,
									bookmark: {lastTime: new Date(), lastIndex:0},
									rows: [
										{item: 'No one can make you feel inferior without your consent.'},
										{item: "If you can't do great things, do small things in a great way."},
										{
										 item: "This life is what you make it. No matter what, you're going to mess up sometimes, it's a universal truth."+
										 			 " But the good part is you get to decide how you're going to mess it up. Girls will be your friends -"+
													 " they'll act like it anyway. But just remember, some come, some go. The ones that stay with you through"+
													 " everything - they're your true best friends. Don't let go of them. Also remember, sisters make the best"+
													 " friends in the world. As for lovers, well, they'll come and go too. And baby, I hate to say it, most of"+
													 " them - actually pretty much all of them are going to break your heart, but you can't give up because if"+
													 " you give up, you'll never find your soulmate. You'll never find that half who makes you whole and that goes"+
													 " for everything. Just because you fail once, doesn't mean you're gonna fail at everything. Keep trying,"+
													 " hold on, and always, always, always believe in yourself, because if you don't, then who will, sweetie?"+
													 " So keep your head high, keep your chin up, and most importantly, keep smiling, because life's a beautiful"+
													 " thing and there's so much to smile about."
										}
									]
								}
							)),
							AsyncStorage.setItem('长按词集会进入整理页面',JSON.stringify(
								{
									totalLength: 0,
									lastContentsLocation: Number.MAX_SAFE_INTEGER,
									bookmark: {lastTime: new Date(), lastIndex:0},
									rows: []
								}
							))
						]);
				}).then(()=>{
					return {'软件说明':'','用法':'','示例词集':'','长按词集会进入整理页面':''};
				});
			}else{

				let dbNameCollection = JSON.parse(value);

				//if dbNameCollection is an Array, convert to object(becasue I used array to store dbNameCollection before, now I use object)
				if(Array.isArray(dbNameCollection)){

					//array change to object, their cover image initially set to empty string
					let objectDBNameCollection = dbNameCollection.reduce((accumulator,currentValue)=>{
					 	accumulator[currentValue] = "";
						return accumulator;
					},{});

					return AsyncStorage.setItem('dbNameCollection',JSON.stringify(objectDBNameCollection)).then(()=>{
						return objectDBNameCollection;
					})
				}
				return dbNameCollection;
			}
		})
	},
	//
	addDataItemNameToDbNameCollection : function(dataItemName){

		return rvDB.getDbNameCollection().then((dbNameCollection)=>{

			//dbNameCollection has no dataItemName
			if(!dbNameCollection.hasOwnProperty(dataItemName)){

				return bookAPI.getBookID(dataItemName).then((matchBooks)=>{

					if(matchBooks.count > 0){
						return bookAPI.getBookCoverUrl(matchBooks.books[0].id);
					}else{
						throw "在豆瓣找不到《"+dataItemName+"》的封面";
					}

				}).catch((e)=>{

					ToastAndroid.show(""+e,ToastAndroid.LONG);
					return ''; //if can't get the book cover url, then return empty string

				}).then((url)=>{
					// in case url is undefined
					if(url === undefined){
						url = '';
					}
					dbNameCollection[dataItemName] = url;
					return AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));

				});
			}
		})
	},

	delectDataItemNameFromDbNameCollecion : function(dataItems){

		return rvDB.getDbNameCollection().then((dbNameCollection)=>{

			dataItems.forEach((dataItemName)=>{
				if(dbNameCollection.hasOwnProperty(dataItemName)){
					delete dbNameCollection[dataItemName];
				}
			})

			return AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));

		})
	},
	addData : function(dataItemName, contents, reg){

		return AsyncStorage.getItem(dataItemName).then((value)=>{

			let dataItem;

			if(value === null){

				dataItem={
					totalLength: 0,
					lastContentsLocation: 0,
					bookmark: {lastTime: new Date(), lastIndex:0},
					rows: []
				}

			}else{

				dataItem = JSON.parse(value);

			}

			// ignore contents which program had already readed, only updata new contents
			contents = contents.slice(dataItem.lastContentsLocation);

			// updata contents marker
			dataItem.lastContentsLocation += contents.length;

			// keep rows length in order to count the items we add
			let oldLength = dataItem.rows.length;

			while((word=reg.exec(contents)) !== null){

				dataItem.totalLength += 1;
				dataItem.rows.push({item: word[1]});

			}

			return AsyncStorage.setItem(dataItemName, JSON.stringify(dataItem)).then(()=>{
				return rvDB.addDataItemNameToDbNameCollection(dataItemName).then(()=>{

					return dataItem.rows.length - oldLength;
				})
			});
		})
	},//1.检查内容格式是否符合；2.有相同名字的，是否覆盖；3.没有相同名字的，要把名字放回dbNameCollection
	addJsonData: function(dataItemName, contents, checkPropertyArray){
		//把赋值变成promise，或者用try，但是catch处有promise reject
		return Promise.try(()=>{

			return JSON.parse(contents);

		}).then((dataItem)=>{

			if(checkPropertyArray.every((propertyValue)=>dataItem.hasOwnProperty(propertyValue))){

				return Promise.all([AsyncStorage.getItem(dataItemName), dataItem]);

			}else{

				return Promise.reject(new Error('该JSON文档不符合RoteVocab的数据规范'));
			}

		}).then(([value,dataItem])=>{

			//this dataItemName not exist
			if(value === null){

				return AsyncStorage.setItem(dataItemName, JSON.stringify(dataItem)).then(()=>{
					return rvDB.addDataItemNameToDbNameCollection(dataItemName);
				});

			}else{

				let oldDataItem = JSON.parse(value);

				// new data cover condiction:
				// 1. new data lastContentsLocation further;
				// 2. if both lastContentsLocation is the same, new data's item rows fewer
				if((dataItem.lastContentsLocation > oldDataItem.lastContentsLocation)
					|| (dataItem.lastContentsLocation === oldDataItem.lastContentsLocation && dataItem.rows.length <= oldDataItem.rows.length)){
					return AsyncStorage.setItem(dataItemName,JSON.stringify(dataItem));
				}else{
					return Promise.reject(new Error('旧文档无法覆盖新文档，但你可选择用新的名字来创建该文档。'));
				}
			}
		});
	},
	showDataItemRows: function(dataItemName){

		return AsyncStorage.getItem(dataItemName).then((value)=>{

			let dataItem = JSON.parse(value);
			let lastYLocation = 0;

			// if no item left, then return null
			if(dataItem.rows.length == 0) return [null,lastYLocation];

			let now = new Date();
			let lastTime = new Date(dataItem.bookmark.lastTime);

			// open again in the same day, then give back the record leave position
			if((now.getMonth() === lastTime.getMonth()) &&
					(now.getDate() === lastTime.getDate())){

				lastYLocation = dataItem.bookmark.lastIndex;

			}

			return [dataItem.rows, lastYLocation];
		})
	},
	delectDataItem: function(dataItemName, index){

		return AsyncStorage.getItem(dataItemName).then((value)=>{

			let dataItem = JSON.parse(value);

			dataItem.rows.splice(index,1)

			return AsyncStorage.setItem(dataItemName, JSON.stringify(dataItem));
		})

	},
	delectDataCollection: function(dataItemNames){

		let delectDataItemArray = dataItemNames.map((dataItemName)=>{
			return AsyncStorage.removeItem(dataItemName);
		})

		return Promise.all(delectDataItemArray).then(()=>{
			return rvDB.delectDataItemNameFromDbNameCollecion(dataItemNames);
		})

	},
	saveDataItemBookmark: function(dataItemName, lastYLocation){

		return AsyncStorage.getItem(dataItemName).then((value)=>{
			let dataItem = JSON.parse(value);

			dataItem.bookmark.lastTime = new Date();
			dataItem.bookmark.lastIndex = lastYLocation;

			return AsyncStorage.setItem(dataItemName,JSON.stringify(dataItem));
		})
	},
	changeItemBookCoverUrl: function(dataItemName, url){

		return rvDB.getDbNameCollection().then((dbNameCollection)=>{

			dbNameCollection[dataItemName] = url;

			return AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));

		});
	},
}


var doubanBookAPIUrl = 'https://api.douban.com/v2/book/';

var bookAPI = {
	getBookID: function(bookName, count = 20){

		return fetch(doubanBookAPIUrl+'search?q='+bookName.split(' ').join('%2B')+
			'&count='+count+'&fields=id,title').then((res)=>{

				if(!res.ok) throw res.status+", 获取图书ID时遇到网络故障";
				return res.text();

			}).then((body)=>{

				return JSON.parse(body);

			});
	},

	getBookCoverUrl: function(bookID){
		//ToastAndroid.show(bookID+"",ToastAndroid.SHORT);
		return fetch(doubanBookAPIUrl+bookID+"?fields=images").then(function(res){

			if(!res.ok) throw res.status+", 获取图书封面时遇到网络故障";
			return res.text();

		}).then(function(body){

			return JSON.parse(body).images.large;

		});
	}
}

module.exports = {rvDB, bookAPI};
