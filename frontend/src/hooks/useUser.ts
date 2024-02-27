import { useDispatch, useSelector } from "react-redux"
import { setUserDataAction, cleanUserDataAction } from "../store/slices/userSlice"
import { RootState } from "../store/types"

type State = {
    userInfo: {
        Data: {
            login: string
        },
    }
}

export const useUser = () => {
	const { Data } = useSelector((state: RootState) => state.user );
	const { login } = Data;
	const dispatch = useDispatch();

	const setUser = (value: State) => {
		dispatch(setUserDataAction(value.userInfo));
	}

	const resetUser = () => {
		dispatch(cleanUserDataAction());
	}

	return {
		login,
		setUser,
		resetUser,
	}
}
