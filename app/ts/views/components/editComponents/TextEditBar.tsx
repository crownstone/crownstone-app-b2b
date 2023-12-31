
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("TextEditBar", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Icon } from '../Icon';
import {styles, colors, menuStyles} from '../../styles'
import { TextEditInput } from './TextEditInput'
import { emailChecker, characterChecker, numberChecker, urlChecker } from "../../../util/Util";

export class TextEditBar extends Component<any, any> {
  verificationContent : any;
  refName : string;
  refNameVerification : string;
  validationTimeout : any;

  constructor(props) {
    super(props);
    this.state = {validation: undefined, passwordSecureDisplay: props.initiallyExposed ? false : true};

    this.verificationContent = '';
    this.refName = (Math.random() * 1e9).toString(36);
    this.refNameVerification = (Math.random() * 1e9).toString(36);
    this.validationTimeout = undefined;
  }

  // the alwaysShowState prop forces the validationState to be checked and updated
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.alwaysShowState === true && this.state.validation === undefined) {
      // we set the timeout to ensure it has been drawn once. It needs to be rendered for the refs to work.
      this.validationTimeout = setTimeout(() => {
        if (this.props.validation !== undefined) {
          this.validate(this.props.value)
        }
      }, 10);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.validationTimeout);
  }

  validateCustom(value, customBehaviours = this.props.validation) {
    // check length
    let trimmedValue = value.trim();

    if (customBehaviours.minLength  !== undefined && trimmedValue.length < customBehaviours.minLength)
      return 'errorTooShort';
    if (customBehaviours.maxLength  !== undefined && value.length > customBehaviours.maxLength)
      return 'errorTooLong';

    // check content
    if (customBehaviours.numbers    !== undefined && customBehaviours.numbers.allowed === false && numberChecker(value) === true)
      return 'errorNumber';
    if (customBehaviours.numbers    !== undefined && customBehaviours.numbers.mandatory === true && numberChecker(value) === false)
      return 'errorNoNumber';
    if (customBehaviours.characters !== undefined && customBehaviours.characters.allowed === false && characterChecker(value) === true)
      return 'errorCharacter';
    if (customBehaviours.characters !== undefined && customBehaviours.characters.mandatory === true && characterChecker(value) === false)
      return 'errorNoCharacter';

    // check if the verification matches the
    if (this.props.verification === true && this.verificationContent !== (this.refs[this.refName] as any).state.value)
      return 'errorNoMatch';

    return 'valid'
  }

  validateInput(value) {
    switch(this.props.validation) {
      case 'email':
        return emailChecker(value) ? 'valid' : 'errorInvalid';
      case 'url':
        return urlChecker(value) ? 'valid' : 'errorInvalid';
      case 'password':
        return this.validateCustom(value, {minLength: 1});
      default:
        if (typeof this.props.validation === 'object') {
           return this.validateCustom(value)
        }
        return 'valid'
    }
  }

  validate(value) {
    // handle the validation
    if (this.props.verification === undefined  && this.props.validation !== undefined) {
      let result = this.validateInput(value);
      this.setState({validation: result});
      if (this.props.validationCallback) {
        this.props.validationCallback(result);
      }
    }
    // handle the verification
    else if (this.refs && this.refs[this.refNameVerification]) {
      // copy the content of the validation text area to this.verificationContent to ensure it is persisted across redraws.
      if (this.props.verification)
        this.verificationContent = (this.refs[this.refNameVerification] as any).state.value;

      // if we need to do validation, validate the input.
      if (this.props.validation !== undefined || this.props.verification) {
        let result = this.validateInput(value);
        this.setState({validation: result});
        if (this.props.validationCallback) {
          this.props.validationCallback(result);
        }
      }
    }
  }

  getValidationIcons() {
    if (this.props.validationMethod === 'icons') {
      if (this.state.validation === 'valid')
        return <Icon name="ios-checkmark-circle" size={18} color={colors.green.hex} style={{paddingLeft:3}}/>;
      else if (this.state.validation === undefined)
        return undefined;
      else // we can have many different types of errors
        return <Icon name="ios-close-circle" size={18} color={'#f04928'} style={{paddingLeft:3}}/>;
    }
    return undefined;
  }

  getExposeIcon() {
    if (this.props.secureTextEntry && this.props.showExposeIcon !== false) {
      // check if we're also showing the validation icons.
      let rightOffset = 0;
      if (this.props.validationMethod === 'icons') {
        if (this.state.validation === 'valid')
          rightOffset = 30;
        else if (this.state.validation === undefined)
          rightOffset = 0;
        else // we can have many different types of errors
          rightOffset = 30;
      }
      return (
        <TouchableOpacity style={{position:'absolute', top:0, right: rightOffset, height:this.props.barHeight, width: 40, alignItems:'center', justifyContent: 'center'}} onPress={() => { this.setState({passwordSecureDisplay: !this.state.passwordSecureDisplay })}}>
          <Icon
            name={'md-eye'}
            color={Platform.OS === 'ios' ? (this.state.passwordSecureDisplay ? colors.lightGray2.hex : colors.darkGray2.hex) : colors.lightGray2.hex}
            size={20}
          />
        </TouchableOpacity>
      );
    }
    return undefined;
  }


  render() {
    return (
      <View style={[menuStyles.listView, {height:this.props.barHeight}]}>
        { this.props.label !== null && <Text style={menuStyles.listText}>{this.props.label}</Text> }
        <TextEditInput
          ref={this.refName}
          __validate={(value) => {this.validate(value)}}
          {...this.props}
          secureTextEntry={this.props.secureTextEntry ? (Platform.OS === 'android' ? true : this.state.passwordSecureDisplay   ) : undefined}
          visiblePassword={this.props.secureTextEntry ? (Platform.OS === 'android' ? !this.state.passwordSecureDisplay : false ) : undefined}
          placeholder={this.props.placeholder || this.props.label}
          value={this.props.value}
        />
        {this.getValidationIcons()}
        {this.getExposeIcon()}
      </View>
    );

  }
}
