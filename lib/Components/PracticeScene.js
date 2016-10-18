
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  ToolbarAndroid,
  ToastAndroid,
  TouchableOpacity,
  Image,
  BackAndroid,
  Clipboard,
  ScrollView
} from 'react-native';


//import Store from 'react-native-store';
import rvDB from '../rvDB';
import ParsedText from 'react-native-parsed-text'

export default class PracticeScene extends Component {
	constructor(props) {
	  super(props);
	
	  //const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

	  this.state = {
	  	state: "init",
	  	index: 0,
	  	db: null,
	  	totalNum: 0	
	  };

	  this._PracticeSceneBackPressHandler=this._PracticeSceneBackPressHandler.bind(this);
	}

	render() {
		
		//this.scrollViewRef.scrollTo({y:0});
		switch(this.state.state){
			case "init":
			 	return (
					<ActivityIndicator size="large" style={[styles.centering, {height: 80}]} />
			 	);
			case "initDone":				
				//ToastAndroid.show("in initDone",ToastAndroid.SHORT);
				return (		
					<View style={{flex:1}}>
				    	<ToolbarAndroid
				            navIcon={require('../PNG/arrow_back.png')}
				            title={this.props.db}
				            titleColor="white"				      
				            style={styles.toolBar}
				            onIconClicked={() => {
				            	
				            	rvDB.saveDataItemBookmark(this.props.db,this.state.index).then(()=>{
				            		this.props.navigator.pop();
				            	}).catch((e)=>{
				            		ToastAndroid.show(''+e,ToastAndroid.SHORT);
				            	})			            	
				            }}
				        />	
				        {/*如何把ScrollView放在中间*/}			       				 
				        <View style={styles.cardContainer}>			     
				         	<ScrollView 
				         		ref={(scrollViewRef) => this.scrollViewRef = scrollViewRef}
				         		style={{marginTop:30}}
				         		onContentSizeChange={()=> this.scrollViewRef.scrollTo({y:0})}				    
				         	>
					         	<View style={styles.card}>	         		
					         		<Text style={styles.countNumShow}>{(this.state.index+1)+"/"+this.state.totalNum}</Text>				         			
					         			
			         				<ParsedText 
					         			style={styles.textShow}
					         			parse={
					         				[
					         					{pattern:/\w+/,onPress:this._handleWordPress}//不支持LongPress
					         				]
					         			}
					         		>
					         			{this.state.db[this.state.index]['item']}
					         		</ParsedText>						         											         						         				         		
					        	</View>
					        </ScrollView>
				        </View>
			         	<View style={styles.controlContainer}>			         		
			         		<View style={styles.imageView}>
				         		<TouchableOpacity onPress={this._backward.bind(this,this.state.index)}>	
				         			<Image 
				         				source={require('../PNG/chevron_left.png')}
				         				style={styles.controlButton}
				         			/>
			         			</TouchableOpacity>
			         		</View>			         					         		
		         			<View style={styles.imageView}>
			         			<TouchableOpacity onPress={this._delect.bind(this,this.state.index)}>
				         			<Image 
				         				source={require('../PNG/cancel.png')}
				         				style={styles.controlButton}
				         			/>
		         				</TouchableOpacity>
		         			</View>		
		         			<View style={styles.imageView}>
			         			<TouchableOpacity onPress={this._forward.bind(this,this.state.index)}>
				         			<Image 
				         				source={require('../PNG/chevron_right.png')}
				         				style={styles.controlButton}
				         			/>
				         		</TouchableOpacity>	
		         			</View>			         		
			         	</View>				         				     									       			         						    
					</View>
				);
			default:
		}				
	}

	/*
	_backwardAndScrollToTop(index){
		this._backward.bind(this,index);//这个没有实行
		this.scrollViewRef.scrollTo({y:0});//这个有实行
	}*/


	_handleWordPress(word){
		ToastAndroid.show('复制'+word+'到剪贴板',ToastAndroid.SHORT);
		Clipboard.setString(word);
	}

	_backward(index){
		if(index !== 0){
			this.setState({index:--index});
		}else{
			ToastAndroid.show("这是第一个",ToastAndroid.SHORT);
		}
		//this.scrollViewRef.scrollTo({y:0});
	}

	_forward(index){
		if(index < this.state.db.length-1){
			this.setState({index:++index});
		}else{
			ToastAndroid.show("这是最后一个", ToastAndroid.SHORT);
		}
		//this.scrollViewRef.scrollTo({y:0});
	}

	
	_delect(index) {

		var data = this.state.db.slice();
		//var delectItem = data[index];//Object
	
		rvDB.delectDataItem(this.props.db, index).then(()=>{
			data.splice(index,1);
			//唯一的一个删除
			if(data.length === 0){
				rvDB.saveDataItemBookmark(this.props.db, index).then(()=>{
					this.props.navigator.pop();
				}).catch((e)=>{
					ToastAndroid.show(''+e,ToastAndroid.SHORT);
				})				
			}else{
				//最后一个删除
				if(index === data.length){
					index = index-1;					
				}
				this.setState({
					index: index,
					db: data,
					totalNum: data.length
				})
			}
			ToastAndroid.show("删除成功", ToastAndroid.SHORT);
		}).catch((e)=>{
			ToastAndroid.show('remove occur wrong: '+e, ToastAndroid.SHORT);
		})	
	}

	_PracticeSceneBackPressHandler(){
		rvDB.saveDataItemBookmark(this.props.db,this.state.index).then(()=>{
    		this.props.navigator.pop();
    	}).catch((e)=>{
    		ToastAndroid.show(''+e,ToastAndroid.SHORT);
    	})	
	}

	componentDidMount(){

		rvDB.showDataItemRows(this.props.db).then(([results,index]) => {
			if(results === null){
				this.props.navigator.pop();
				ToastAndroid.show("没有要背的东西",ToastAndroid.SHORT);
			}else{
				//ToastAndroid.show('in componentDidMount',ToastAndroid.SHORT);
				//ToastAndroid.show(JSON.stringify(results),ToastAndroid.LONG);
				this.setState({
					state: "initDone",
					index: index,
					db: results,//array
					totalNum: results.length
				});
			}
		}).catch((e) => {
			console.log(e);
		});

		BackAndroid.addEventListener('PracticeSceneBackPress', this._PracticeSceneBackPressHandler);
  	}

  	componentWillUnmount(){
  		//ToastAndroid.show('in componentWillUnmount',ToastAndroid.SHORT);
  		BackAndroid.removeEventListener('PracticeSceneBackPress',this._PracticeSceneBackPressHandler);
  	}

}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  cardContainer: {
  	flex: 6,
  	//alignItems: 'center',
    justifyContent: 'center',
    //borderWidth:1,
  	//borderColor:'black',
  	backgroundColor: "#FAFAFA"
  },
  card: {
  	elevation:7,
  	//borderWidth:2,
  	//borderColor:'#E0E0E0',
  	//margin:10,
  	borderRadius:2,
  	marginHorizontal:12,
  	marginVertical:5,
  	//padding:10,
  	minHeight:150,//可能需要更好的办法
  	//height:200,
  	backgroundColor: "#FFFFFF",
  	//shadowColor: "black",
  	//shadowOffset: {2,2},
  	//shadowOpacity: 0.7
  	//marginVertical: 20
  },
  controlContainer:{
  	flex:1,
  	backgroundColor: "#FAFAFA",
  	//borderWidth:1,
  	//borderColor:"black",
  	flexDirection:'row',
  	justifyContent:'space-around',
  	//alignItems:'center'
  },
  imageView: {
  	height:52,
  	width:52,
  	borderRadius: 52/2,
  	//borderWidth:1,
  	//borderColor:"black",
  	backgroundColor:'#EF5350',
  	//flex:1
  },
  controlButton:{
  	marginTop: 8,//图片是36像素，所以是(52-36)/2=8
	marginLeft:	8
  },
  textShow: {
  	fontSize:21,
  	marginHorizontal:15,
  	marginBottom:15,
  	lineHeight:28
  },
  countNumShow:{
  	//height:24,
  	fontSize:21,
  	textAlign:'center',
  	marginVertical:5,
  	opacity: 0.54,
  	//marginBottom:5
  },
  toolBar:{
  	height:56,
  	backgroundColor: "#2196F3"
  }
});