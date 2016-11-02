var AsyncStorage = require('react-native').AsyncStorage;
var ToastAndroid = require('react-native').ToastAndroid;
var Alert = require('react-native').Alert;
var Promise = require("bluebird");
/*
rvDB
|——dbNameCollection: array -> record dbItems' name
|——dbItem1: object -> property:{lastContentsLocation: string, bookmark:{lastTime: string(when compare, should change to Date object), lastIndex: number},rows:array}
|——dbItem2
|——...
*/
var rvDB = {

	getDbNameCollection : function(){
		return AsyncStorage.getItem('dbNameCollection').then((value)=>{
			if(value == null){
				return AsyncStorage.setItem('dbNameCollection',JSON.stringify(['软件说明','用法','示例词集','这里显示的词条都能长按删除'])).then(()=>{
					//return ['示例'];
					//var dataItem=

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
									 item: "This life is what you make it. No matter what, you're going to mess up sometimes, it's a universal truth. But the good part is you get to decide how you're going to mess it up. Girls will be your friends - they'll act like it anyway. But just remember, some come, some go. The ones that stay with you through everything - they're your true best friends. Don't let go of them. Also remember, sisters make the best friends in the world. As for lovers, well, they'll come and go too. And baby, I hate to say it, most of them - actually pretty much all of them are going to break your heart, but you can't give up because if you give up, you'll never find your soulmate. You'll never find that half who makes you whole and that goes for everything. Just because you fail once, doesn't mean you're gonna fail at everything. Keep trying, hold on, and always, always, always believe in yourself, because if you don't, then who will, sweetie? So keep your head high, keep your chin up, and most importantly, keep smiling, because life's a beautiful thing and there's so much to smile about."
									}
								]
							}
						)),
						AsyncStorage.setItem('这里显示的词条都能长按删除',JSON.stringify(
							{
								totalLength: 0,
								lastContentsLocation: Number.MAX_SAFE_INTEGER,
								bookmark: {lastTime: new Date(), lastIndex:0},
								rows: []
							}
						))
					]);
					
				}).then(()=>{
					return ['软件说明', '用法', '示例词集', '这里显示的词条都能长按删除'];
				});
				//AsyncStorage.setItem('dbData',JSON.stringify({}));
			}else{
				return JSON.parse(value)
			}

			//ToastAndroid.show(JSON.stringify(dbNameCollection),ToastAndroid.SHORT);
			
			//return dbNameCollection;
		
		}).catch((e)=>{
			console.log(e);
		});
	},
	addDataItemNameToDbNameCollection : function(dataItemName){
		
		return AsyncStorage.getItem('dbNameCollection').then((value)=>{
			var dbNameCollection = JSON.parse(value);
			//没有同名的才房进去
			if(dbNameCollection.indexOf(dataItemName) === -1){
				dbNameCollection.push(dataItemName);
			}			
			return AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));
		}).catch((e)=>{
			console.log(e);
		})
	},
	delectDataItemNameFromDbNameCollecion : function(dataItems){
		
		return AsyncStorage.getItem('dbNameCollection').then((value)=>{
			var dbNameCollection = JSON.parse(value);
			
			dataItems.forEach((currentValue)=>{
				let index;
				if((index = dbNameCollection.indexOf(currentValue)) !== -1){
					dbNameCollection.splice(index,1);
				}
			})
			//var index = dbNameCollection.indexOf(dataItemName);
			//找不到index会变成-1，但应该不会出现这种情况,在想想！
			//ToastAndroid.show('index: '+index,ToastAndroid.SHORT);
			//ToastAndroid.show('in delectDataItemNameFromDbNameCollecion2',ToastAndroid.SHORT);
			//dbNameCollection.splice(index,1);
			
			return AsyncStorage.setItem('dbNameCollection', JSON.stringify(dbNameCollection));
		
		}).catch((e)=>{
			console.log(e);
		})
	},
	addData : function(dataItemName, contents, reg){
		return AsyncStorage.getItem(dataItemName).then((value)=>{
			
			var dataItem;
			
			if(value == null){
				//这样可行吗
				//var now = new Date();
				dataItem={
					//autoinc: 0,
					totalLength: 0,
					lastContentsLocation: 0,
					bookmark: {lastTime: new Date(), lastIndex:0},
					rows: []
				}
				//先看是否可以成功创建时间
				//ToastAndroid.show('create dataItem, Date is: '+dataItem.bookmark.lastTime,ToastAndroid.SHORT);
			}else{
				dataItem=JSON.parse(value);
			}

			contents = contents.slice(dataItem.lastContentsLocation);
			dataItem.lastContentsLocation += contents.length;

			//var autoinc = dataItem.autoinc;
			var oldLength = dataItem.rows.length;
			
			while((word=reg.exec(contents)) !== null){
				//看看bookmark是否成功
				//ToastAndroid.show(word,ToastAndroid.LONG);
				dataItem.totalLength += 1;
				dataItem.rows.push({item: word[1]});

			}

			//ToastAndroid.show(JSON.stringify(dataItem),ToastAndroid.LONG);

			//应该要两个promise都成功
			return AsyncStorage.setItem(dataItemName, JSON.stringify(dataItem)).then(()=>{
				return rvDB.addDataItemNameToDbNameCollection(dataItemName).then(()=>{
					//ToastAndroid.show('in add data item name to dbNameCollection',ToastAndroid.SHORT);
					return dataItem.rows.length-oldLength;
				})
			});

		}).catch((e)=>{
			console.log(e);
		})
	},//1.检查内容格式是否符合；2.有相同名字的，是否覆盖；3.没有相同名字的，要把名字放回DbNameCollection
	addJsonData: function(dataItemName, contents, checkPropertyArray){
		//把赋值变成promise，或者用try，但是catch处有promise reject
		return Promise.try(()=>{
			//		
			var dataItem = JSON.parse(contents);
			return dataItem;
		}).then((dataItem)=>{
			if(checkPropertyArray.every((indexValue)=>dataItem.hasOwnProperty(indexValue))){
				return Promise.all([AsyncStorage.getItem(dataItemName),dataItem]);	
			}else{
				return Promise.reject(new Error('该JSON文档不符合RoteVocab的数据规范'));
			}
		}).then(([value,dataItem])=>{

			if(value === null){
				return AsyncStorage.setItem(dataItemName,JSON.stringify(dataItem)).then(()=>{
					return rvDB.addDataItemNameToDbNameCollection(dataItemName);
				});
			}else{
				
				//ToastAndroid.show(''+value,ToastAndroid.SHORT);
				//ToastAndroid.show(''+dataItem,ToastAndroid.SHORT);
				var oldDataItem = JSON.parse(value);
				//可以直接覆盖的条件：1、新导入数据记录读取的位置比旧的远；2、两者读取位置一致时，新文件剩下的条目比旧的要少

				if((dataItem.lastContentsLocation > oldDataItem.lastContentsLocation) 
					|| (dataItem.lastContentsLocation === oldDataItem.lastContentsLocation && dataItem.rows.length <= oldDataItem.rows.length)){
					return AsyncStorage.setItem(dataItemName,JSON.stringify(dataItem));
				}else{

					return Promise.reject(new Error('旧文档无法覆盖新文档，但你可选择用新的名字来创建该文档。'));
				}
			}
		});
	},/*//用旧文档覆盖新文档的函数，由于已经通过了addJsonData函数的检查，无需再检查一遍
	addJsonDataWithoutCheck: function(dataItemName, contents) {
		return AsyncStorage.setItem(dataItemName,contents);
	},*/
	showDataItemRows: function(dataItemName){
		//ToastAndroid.show("in showDataItemRows",ToastAndroid.SHORT);
		return AsyncStorage.getItem(dataItemName).then((value)=>{
			
			var dataItem = JSON.parse(value);
			var index = 0;
			//ToastAndroid.show(''+dataItem.bookmark.lastTime,ToastAndroid.SHORT);

			if(dataItem.rows.length == 0) return [null,index];
			//ToastAndroid.show('skip return null',ToastAndroid.SHORT);
			var now = new Date();
			var lastTime = new Date(dataItem.bookmark.lastTime);
			//ToastAndroid.show('now :'+now,ToastAndroid.SHORT);
			//dataItem中的lasttime不在是Date格式，会是string吗？
			//ToastAndroid.show('now month:'+now.getMonth(),ToastAndroid.SHORT);
			//ToastAndroid.show('lastTime:'+dataItem.bookmark.lastTime,ToastAndroid.SHORT);
			//ToastAndroid.show('lastTime is a string? '+String.isString(dataItem.bookmark.lastTime),ToastAndroid.SHORT);
			//ToastAndroid.show('lastTime month'+lastTime.getMonth(),ToastAndroid.SHORT);

			if((now.getMonth() === lastTime.getMonth()) && 
					(now.getDate() === lastTime.getDate())){
				//ToastAndroid.show('in if',ToastAndroid.SHORT);
				index = dataItem.bookmark.lastIndex === dataItem.rows.length-1? 0 : dataItem.bookmark.lastIndex;
				//ToastAndroid.show("index: "+index,ToastAndroid.SHORT);
			}
			//ToastAndroid.show("after now",ToastAndroid.SHORT);
			//dataItem.bookmark.lastTime = now;
			return [dataItem.rows, index];
		})
	},
	delectDataItem: function(dataItemName, index){
		return AsyncStorage.getItem(dataItemName).then((value)=>{
			
			var dataItem = JSON.parse(value);
			
			dataItem.rows.splice(index,1)//有可能会出问题

			return AsyncStorage.setItem(dataItemName,JSON.stringify(dataItem));
		})
	},
	delectDataCollection: function(dataItems){
		let promiseArray = dataItems.map((currentValue)=>{
			return AsyncStorage.removeItem(currentValue);
		})

		return Promise.all(promiseArray).then(()=>{
			return rvDB.delectDataItemNameFromDbNameCollecion(dataItems);
		})
			
		/*
		return AsyncStorage.removeItem(dataItemName).then(()=>{
			return rvDB.delectDataItemNameFromDbNameCollecion(dataItemName);
		})*/
	},
	saveDataItemBookmark: function(dataItemName, index){
		return AsyncStorage.getItem(dataItemName).then((value)=>{
			var dataItem = JSON.parse(value);
			dataItem.bookmark.lastTime = new Date();
			dataItem.bookmark.lastIndex = index;
			return AsyncStorage.setItem(dataItemName,JSON.stringify(dataItem));
		})
	}
}

module.exports = rvDB;