import React, {Component} from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  Image
} from 'react-native';

class CircleButton extends Component{
  constructor(props){
    super(props);

    this.state = {
      size: new Animated.Value(0),
    }
  }

  componentDidMount(){
    //this.state.size.setValue(0);
		Animated.sequence([
			Animated.delay(this.props.delay || 200),
			Animated.spring(this.state.size,{
				toValue:this.props.size
			})
		]).start();
  };

  render(){
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Animated.View style={{
            marginRight:this.props.position.x,
            marginBottom:this.props.position.y,
            justifyContent:'center',
            backgroundColor:this.props.backgroundColor,
            width: this.state.size ,
            height: this.state.size ,
            borderRadius: this.state.size.interpolate({
              inputRange:[0,this.props.size],
              outputRange:[0,this.props.size/2]
            }),
          }}
        >
          <Text style={this.props.style}>{this.props.text}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

class CustomTextButton extends Component{
  constructor(props){
    super(props)
  }

  render(){
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Text style={this.props.style}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

class CustomImageButton extends Component{
  constructor(props){
    super(props)
  }

  render(){
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Image source={this.props.source} style={this.props.style}/>
      </TouchableOpacity>
    )
  }
}

export {CircleButton, CustomTextButton, CustomImageButton};
