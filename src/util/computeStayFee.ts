import { differenceInDays } from 'date-fns';

type props = {
    timeIn:    Date | string,
    timeOut: Date | string,
    roomFee: number
}

export default function computeStayFee({timeIn, timeOut, roomFee}: props){

    const days  = differenceInDays(timeOut, timeIn);

    const totalDays = days <= 0 ? 1 : days;
    
    return  roomFee * totalDays;
}