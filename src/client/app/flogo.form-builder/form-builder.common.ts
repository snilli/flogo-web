import {Injectable} from '@angular/core';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../common/constants';

@Injectable()
export class FlogoFormBuilderCommon {
  directions = {
    output: 'output',
    input: 'input'
  };

  getParameterDirections() {
    return this.directions;
  }


  getStructureFromAttributes(structure:string, attributes:any) {
    var returnValue =  _.get(attributes, structure, []);

    return this._getArray(returnValue);
  }

  _getArray(obj:any) {

    if(!Array.isArray(obj)) {
      return [];
    }

    return obj;
  }

  _mapTypeToConstant(type:string|FLOGO_TASK_ATTRIBUTE_TYPE) {
    switch(type) {
      case 'string':
      case FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;

      case 'number':
      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        return FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER;

      case 'boolean':
      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
        return FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN;

      case 'object':
      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
        return FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT;

      case 'map':
      case 'params':
      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
        return FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS;

      case 'any':
      case FLOGO_TASK_ATTRIBUTE_TYPE.ANY:
            return FLOGO_TASK_ATTRIBUTE_TYPE.ANY;

      default:
        return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
    }
  }

  getControlByType(item:any, paramDirection:string) {
    let control:string = '';

    switch(this._mapTypeToConstant(item.type)) {
      case  FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        control =  'FieldTextBox';
        break;

      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        control = 'FieldNumber';
        break;

      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
        control='FieldRadio';
        break;

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
        control='FieldTextArea';
        break;

      case FLOGO_TASK_ATTRIBUTE_TYPE.ANY:
        control='FieldTextArea';
        break;

      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
        control='FieldObject';
        break;

      default:
        control='FieldTextBox';
        break;
    }

    if(paramDirection == this.directions.output && item.type == FLOGO_TASK_ATTRIBUTE_TYPE.STRING) {
      control = 'FieldTextArea';
    }

    if(item.allowed) { control= 'FieldListBox'; }

    return {control};

  }

}
