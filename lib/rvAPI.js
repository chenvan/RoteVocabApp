var AsyncStorage = require('react-native').AsyncStorage;
var ToastAndroid = require('react-native').ToastAndroid;
//var Alert = require('react-native').Alert;
var jsdiff = require('diff');
var Promise = require("bluebird");
var RNFS = require('react-native-fs');
/*
rvDB
|——dbNameCollection: object -> {dbItem1: coverImageUrl, dbItem2: coverImageUrl, ...}
|——dbItem1: object -> {totalLength: number,bookmark:{lastTime: string(when compare, should change to Date object), lastIndex: number},rows:array}
|——dbItem1LastContent: string
|——dbItem2: object -> ...
|——dbItem2LastContent: string
|——...
*/

var rvDB = {
	//return db(object)
	getDbNameCollection: async function(){
		try{

			let value = await AsyncStorage.getItem('dbNameCollection');

			if(value === null){
				await AsyncStorage.setItem('dbNameCollection', JSON.stringify({ '软件说明': '', '用法': '', '示例词集': ''}));
				await AsyncStorage.multiSet([
					['软件说明', JSON.stringify({
						totalLength: 2,
						bookmark: {lastTime: new Date(), lastIndex:0},
						rows: [
								{item: '透析记词辅助你更好地使用透析法学习英文'},
								{item: '想了解透析法，请退回到主页，点击菜单按钮，再点击软件用法。该文章有透析法相关的链接'}
						]
					})],
					['软件说明LastContent', JSON.stringify(
						'"透析记词辅助你更好地使用透析法学习英文"\n'+
						'"想了解透析法，请退回都主页，点击菜单按钮，再点击软件用法。该文章有透析法相关的链接"'
					)],
					['用法', JSON.stringify({
						totalLength: 5,
						bookmark: {lastTime: new Date(), lastIndex:0},
						rows: [
							{item: '把阅读类APP高亮的英文导出到txt文档\n注意：txt文档中的每一条高亮都需要有双引号包住'},
							{item: '在透析记词里，把上述的txt文档导入进来'},
							{item: '复习前，先打开能捕获剪贴板的词典'},
							{item: '复习时，轻点生词，这样该单词就会自动复制到剪贴板。随后，词典APP自动弹出解释'},
							{item: '想了解更多操作，请退回到主页，点击菜单按钮，再点击软件用法'}
						]
					})],
					['用法LastContent', JSON.stringify(
							'"把阅读类APP高亮的英文导出到txt文档\n注意：txt文档中的每一条高亮都需要有双引号包住"\n'+
							'"在透析记词里，把上述的txt文档导入进来"\n'+
							'"复习前，先打开能捕获剪贴板的词典"\n'+
							'"复习时，轻点生词，这样该单词就会自动复制到剪贴板。随后，词典APP自动弹出解释"\n'+
							'"想了解更多操作，请退回到主页，点击菜单按钮，再点击软件用法"'
					)],
					['示例词集',JSON.stringify({
						totalLength: 2,
						bookmark: {lastTime: new Date(), lastIndex:0},
						rows: [
							{item: 'No one can make you feel inferior without your consent.'},
							{item: "If you can't do great things, do small things in a great way."}
						]
					})],
					['示例词集LastContent', JSON.stringify(
							'"No one can make you feel inferior without your consent."\n'+
							'"If you can\'t do great things, do small things in a great way."'
					)]
				]);

				return {'软件说明':'','用法':'','示例词集':''};
			}else{

				let dbNameCollection = JSON.parse(value);

				//if dbNameCollection is an Array, convert to object(becasue I used array to store dbNameCollection before, now I use object)
				if(Array.isArray(dbNameCollection)){

					//array change to object, their cover image initially set to empty string
					let objectDBNameCollection = dbNameCollection.reduce((accumulator,currentValue)=>{
					 	accumulator[currentValue] = "";
						return accumulator;
					},{});

					await AsyncStorage.setItem('dbNameCollection',JSON.stringify(objectDBNameCollection));

					return objectDBNameCollection;
				}else{
					//ToastAndroid.show('in getDbNameCollection: '+value, ToastAndroid.LONG);
					return dbNameCollection;
				}
			}
		}catch(e){
			return Promise.reject(e);
		}
	},//return url(string) or undefined. url can be an empty string, so be careful
	addDataItemNameToDbNameCollection: async function(dataItemName){
		try{
			let dbNameCollection = await rvDB.getDbNameCollection();

			if(!dbNameCollection.hasOwnProperty(dataItemName)){

				let matchBooks = await bookAPI.getBookID(dataItemName);
				let coverUrl;

				if(matchBooks.count > 0){
					coverUrl = await bookAPI.getBookCoverUrl(matchBooks.books[0].id);
					if(coverUrl === undefined){
						coverUrl = '';
					}
				}else{
					ToastAndroid.show('在豆瓣找不到《'+dataItemName+'》的封面', ToastAndroid.SHORT);
					coverUrl = '';
				}

				dbNameCollection[dataItemName] = coverUrl;
				await AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));
				return coverUrl;
			}

		}catch(e){
			return Promise.reject(e);
		}
	},//return null
	deleteDataItemNameFromDbNameCollecion: async function(dataItems){
		try{
			let dbNameCollection = await rvDB.getDbNameCollection();
			dataItems.forEach((dataItemName) => {
				if(dbNameCollection.hasOwnProperty(dataItemName)){
					delete dbNameCollection[dataItemName];
				}
			});
			return AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));
		}catch(e){
			return Promise.reject(e);
		}
	},//return [incressNum, undefined] or [incressNum, url]
	addData: async function(dataItemName, contents, reg){
		try{

			let [value, lastContent] = await Promise.all([
				AsyncStorage.getItem(dataItemName),
				AsyncStorage.getItem(dataItemName+'LastContent')
			]);

			let isDataItemNameExist = value === null ? false : true ;

			let dataItem = isDataItemNameExist ? JSON.parse(value) : {
																																	totalLength: 0,
																																	bookmark: { lastTime: new Date(), lastIndex: 0 },
																																	rows: []
																																};

 		 	if(isDataItemNameExist && lastContent === null){
				//there are no dataItemNameLastContent before, so have to built one in case it fail
				let lastRow = dataItem.rows[dataItem.rows.length-1].item;
				// add first 1 is because lastIndexOF return location, not the length
				// add second 1 is because we should include ", otherwise the jsdiff will find different in lastRow
			 	let lastRowLocation = contents.lastIndexOf(lastRow) + 1 + lastRow.length + 1;
				//ToastAndroid.show('lastRow: '+lastRow, ToastAndroid.LONG);
				//ToastAndroid.show('lastRowLocation: '+lastRowLocation, ToastAndroid.LONG);
				// if we can't find last row, then the contents maybe is not from the same book
				if(lastRowLocation === -1){
					throw new Error('从导入文档中找不到当前同名数据的最后词条，无法判断前后文档是否同源');
				}
			 	let lastContentLocation = lastRowLocation > dataItem.lastContentsLocation ? lastRowLocation : dataItem.lastContentsLocation
				// here is the only place to delete  lastContentsLocation
				// we keep lastContentsLocation until we create lastContent
				delete dataItem.lastContentsLocation;
				lastContent = contents.slice(0, lastContentLocation);
		 	}else if (!isDataItemNameExist && lastContent === null) {
				// if dataItemName is new data, then lastContent is empty string
				lastContent = '';
		 	}else if(lastContent !== null){
				lastContent = JSON.parse(lastContent);
			}

		 let oldLength = dataItem.rows.length;

		 let diff = jsdiff.diffTrimmedLines(lastContent, contents);

		 diff.forEach((part) => {
			 if(part.added){
					//ToastAndroid.show('value: '+ JSON.stringify(part.value), ToastAndroid.LONG)
					let line;
					while((line = reg.exec(part.value)) !== null){
						dataItem.totalLength += 1;
						dataItem.rows.push({item: line[1]});
				 	}
				}
		 });

		 let incressRows = dataItem.rows.length - oldLength;

		 if(incressRows > 0){
			 await AsyncStorage.multiSet([
				 [dataItemName, JSON.stringify(dataItem)],
				 [dataItemName+'LastContent', JSON.stringify((contents))]
			 ]);
		 }


		 if(isDataItemNameExist){
			 return [incressRows, undefined];
		 }else{
			 //url maybe is undefined too
			 let url = await rvDB.addDataItemNameToDbNameCollection(dataItemName)
			 return [incressRows, url];
		 }

		}catch(e){
			return Promise.reject(e);
		}
	},//return url or undefined
	addJsonData: async function(dataItemName, contents, checkPropertyArray){

		try{

			contents = JSON.parse(contents);

			if(!checkPropertyArray.every((propertyValue) => contents.hasOwnProperty(propertyValue))){
				throw new Error('该JSON文档不符合RoteVocab的数据规范');
			}

			let lastContentFromJSON = contents.hasOwnProperty('lastContent') ? contents.lastContent : null;
			delete contents.lastContent;

			// check whether the dataItemName has already existed
			let value = await AsyncStorage.getItem(dataItemName);
			// if dataItemName is not existed, then we just replace it
			if(value === null){
				if(lastContentFromJSON === null){
					await AsyncStorage.setItem(dataItemName, JSON.stringify(contents));
				}else{
					await AsyncStorage.multiSet([
						[dataItemName, JSON.stringify(contents)],
						[dataItemName+'LastContent', JSON.stringify(lastContentFromJSON)]
					]);
				}

			}else{

				let presentDataItem = JSON.parse(value);
				// if dataItemName is existed & his totalLength is bigger, then we do nothing
				if(presentDataItem.totalLength > contents.totalLength){
					throw new Error('旧文档无法覆盖新文档，但你可选择用新的名字来创建该文档。');
				}else{
					//if dataItemName is existed but his totalLength is smaller
					// if json lastContent is existed, for json totalLength is bigger, no matter dataItemNameLastContent is existed or not, we should replace it
					if(lastContentFromJSON !== null){
							await AsyncStorage.multiSet([
								[dataItemName, JSON.stringify(contents)],
								[dataItemName+'LastContent', JSON.stringify(lastContentFromJSON)]
							]);
					}else{
						 let presentLastContent = await AsyncStorage.getItem(dataItemName+'LastContent');
						 // if json totalLength is bigger, json lastContent & present last content both not existed, then we just replace dataItem
						 if(presentLastContent === null){
							 await AsyncStorage.setItem(dataItemName, JSON.stringify(contents));
						 }else{
							 //if json totalLength is bigger. json lastContent is not existed but present last content is existed, it doesn't fit the logic
							 throw new Error('json文档为旧格式，无法替换新格式数据');
						 }
					}
				}
			}
			// return url or undefined
			return rvDB.addDataItemNameToDbNameCollection(dataItemName);
		}catch(e){
			return Promise.reject(e);
		}
	},// return [null, number] or [array, number]
	showDataItemRows: async function(dataItemName){

		try{
			let value = await AsyncStorage.getItem(dataItemName);
			let dataItem = JSON.parse(value);
			let lastYLocation = 0;

			// if no item left, should return null
			if(dataItem.rows.length === 0){

				return [null, lastYLocation];

			}else{

				let now = new Date();
				let lastTime = new Date(dataItem.bookmark.lastTime);
				// open again in the same day, then give back the record leave position
				if((now.getMonth() === lastTime.getMonth()) && (now.getDate() === lastTime.getDate())){
					lastYLocation = dataItem.bookmark.lastIndex;
				}

				return [dataItem.rows, lastYLocation]
			}
		}catch(e){
			return Promise.reject(e);
		}
	},// return null
	deleteDataItem: async function(dataItemName, index){
		try{

			let value = await AsyncStorage.getItem(dataItemName);
			let dataItem = JSON.parse(value);

			dataItem.rows.splice(index, 1);

			return AsyncStorage.setItem(dataItemName, JSON.stringify(dataItem));
		}catch(e){
			return Promise.reject(e);
		}

	},// return null
	deleteDataCollection: async function(dataItemNameList){
		try{

			let deleteDataItemArray = dataItemNameList.map((dataItemName) => {
				return AsyncStorage.multiRemove([dataItemName, dataItemName+'LastContent']);
			});

			await Promise.all(deleteDataItemArray);

			return rvDB.deleteDataItemNameFromDbNameCollecion(dataItemNameList);

		}catch(e){
			return Promise.reject(e);
		}
	},// return null
	saveDataItemBookmark: async function(dataItemName, lastYLocation){
		try{
			let value = await AsyncStorage.getItem(dataItemName);
			let dataItem = JSON.parse(value);

			dataItem.bookmark.lastTime = new Date();
			dataItem.bookmark.lastIndex = lastYLocation;

			return AsyncStorage.setItem(dataItemName, JSON.stringify(dataItem));
		}catch(e){
			return Promise.reject(e);
		}
	},// return url
	changeItemBookCoverUrl: async function(dataItemName, url){
		try{
			let dbNameCollection = await rvDB.getDbNameCollection();
			dbNameCollection[dataItemName] = url;
			await AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));
			return url;
		}catch(e){
			return Promse.reject(e);
		}
	},// return outputpath(string)
	exportJSONData: async function(exportList){
		try{

			let exportPath = RNFS.ExternalStorageDirectoryPath+'/透析记词';

			await Promise.all(exportList.map(async function(exportItemName){
				try{

					let [lastContent, dataItem] = await Promise.all([
						AsyncStorage.getItem(exportItemName+'LastContent'),
						AsyncStorage.getItem(exportItemName)
					])

					dataItem = JSON.parse(dataItem);

					//if we have lastContent, we should add to dataItem and export it
					//if we don't have lastContent, then we do nothing
					if(lastContent !== null){
						lastContent = JSON.parse(lastContent);
						dataItem.lastContent = lastContent;
					}

					await RNFS.writeFile(exportPath+'/'+exportItemName+'.json', JSON.stringify(dataItem), 'utf8');

				}catch(e){
					return Promise.reject(e);
				}
			}));

			return exportPath;

		}catch(e){
			return Promise.reject(e);
		}

	}
}


var doubanBookAPIUrl = 'https://api.douban.com/v2/book/';

var bookAPI = {
	// return object
	getBookID: async function(bookName, count = 20){
		try{
			let res = await fetch(doubanBookAPIUrl+'search?q='+bookName.split(' ').join('%2B')+'&count='+count+'&fields=id,title')
			if(!res.ok){
				throw new Error(res.status+', 获取图书ID时遇到网络故障');
			}
			let body = await res.text();
			return JSON.parse(body);
		}catch(e){
			return Promise.reject(e);
		}
	},//return url(string)
	getBookCoverUrl: async function(bookID){
		try{
			let res = await fetch(doubanBookAPIUrl+bookID+"?fields=images");
			if(!res.ok){
				throw new Error(res.status+', 获取图书封面时遇到网络故障');
			}
			let body = await res.text();
			return JSON.parse(body).images.large;
		}catch(e){
			return Promse.reject(e);
		}
	}
}

module.exports = {rvDB, bookAPI};
