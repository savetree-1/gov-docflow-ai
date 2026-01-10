const initialstate = {
  user: {
    data: {
      first_name: "",
    },
  },
  isLoggedIn: false,
};

const authReducer = (state = initialstate, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
      };

    case "SAVE_PROFILE":
      return {
        ...state,
        user: {
          ...state.user,
          data: action.payload,
        },
      };

    case "LOGOUT":
      // Clear localStorage when logging out
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return {
        ...state,
        isLoggedIn: false,
        user: {
          data: {
            first_name: "",
          },
        },
      };

    default:
      return state;
  }
};

export default authReducer;
