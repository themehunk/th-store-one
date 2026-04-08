import { registerStore } from '@wordpress/data';

export const STORE_NAME = 'th/product-video';

const DEFAULT_STATE = {
  activeTab: 'gallery',
};

const actions = {
  setActiveTab(tab) {
    return {
      type: 'SET_TAB',
      tab,
    };
  },
};

function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.tab,
      };
  }
  return state;
}

registerStore(STORE_NAME, {
  reducer,
  actions,
  selectors: {
    getActiveTab(state) {
      return state.activeTab;
    },
  },
});