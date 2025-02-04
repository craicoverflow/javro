import { combineReducers } from 'redux';
import { SourceMap } from 'json-source-map';
import {
  AVRO_MOUSE_MOVE,
  AvroMouseMoveAction,
  CHANGE_AVRO,
  CHANGE_AVRO_IS_IN_ERROR,
  CHANGE_AVRO_PATH,
  CHANGE_JSON,
  ChangeAvroAction,
  ChangeAvroIsInErrorAction,
  ChangeAvroPathAction,
  ChangeJsonAction,
  SAVE_AVRO_SUCCESS,
  SaveAvroSuccessAction,
} from '../actions/editor';

export interface EditorValue {
  str: string;
  parsed: object | null;
  sourceMap: SourceMap | null;
}

export interface EditorState {
  avro: {
    value: EditorValue;
    isInError: boolean;
    errorMessage: string | null;
    position: { line: number; column: number } | null;
    isPristine: boolean;
  };
  json: {
    value: EditorValue;
  };
  editing: {
    path: string | null;
  };
}

function editing(
  state: { path: string | null } = {
    path: null,
  },
  action: ChangeAvroPathAction
) {
  switch (action.type) {
    case CHANGE_AVRO_PATH: {
      return { ...state, path: action.path };
    }
    default:
      return state;
  }
}

function json(
  state: { value: EditorValue } = {
    value: { str: '', parsed: null, sourceMap: null },
  },
  action: ChangeJsonAction
) {
  switch (action.type) {
    case CHANGE_JSON: {
      return { ...state, value: action.value };
    }
    default:
      return state;
  }
}

function isInError(
  state = false,
  action: ChangeJsonAction | ChangeAvroIsInErrorAction
) {
  switch (action.type) {
    case CHANGE_JSON: {
      return false;
    }
    case CHANGE_AVRO_IS_IN_ERROR: {
      return true;
    }
    default:
      return state;
  }
}

function errorMessage(
  state: string | null = null,
  action: ChangeJsonAction | ChangeAvroIsInErrorAction
) {
  switch (action.type) {
    case CHANGE_JSON: {
      return null;
    }
    case CHANGE_AVRO_IS_IN_ERROR: {
      return action.error;
    }
    default:
      return state;
  }
}

function value(
  state: EditorValue = { str: '', parsed: null, sourceMap: null },
  action: ChangeAvroAction
) {
  switch (action.type) {
    case CHANGE_AVRO: {
      return action.value;
    }
    default:
      return state;
  }
}

function position(
  state: { line: number; column: number } | null = null,
  action: AvroMouseMoveAction
) {
  switch (action.type) {
    case AVRO_MOUSE_MOVE: {
      return action.position;
    }
    default:
      return state;
  }
}

function isPristine(
  state = true,
  action: ChangeAvroAction | ChangeAvroPathAction | SaveAvroSuccessAction
) {
  switch (action.type) {
    case CHANGE_AVRO: {
      return false;
    }
    case CHANGE_AVRO_PATH: {
      return true;
    }
    case SAVE_AVRO_SUCCESS: {
      return true;
    }
    default:
      return state;
  }
}

const avro = combineReducers({
  isInError,
  errorMessage,
  value,
  position,
  isPristine,
});

export default combineReducers({
  json,
  avro,
  editing,
});
