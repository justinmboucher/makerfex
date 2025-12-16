import face1 from '../../../../assets/images/faces/1.jpg';
import face2 from '../../../../assets/images/faces/2.jpg';
import face3 from '../../../../assets/images/faces/3.jpg';
import face4 from '../../../../assets/images/faces/4.jpg';
import face5 from '../../../../assets/images/faces/5.jpg';
import face6 from '../../../../assets/images/faces/6.jpg';
import face7 from '../../../../assets/images/faces/7.jpg';
import face8 from '../../../../assets/images/faces/8.jpg';
import face9 from '../../../../assets/images/faces/9.jpg';
import face10 from '../../../../assets/images/faces/10.jpg';
import face12 from '../../../../assets/images/faces/12.jpg';
import face13 from '../../../../assets/images/faces/13.jpg';
import face14 from '../../../../assets/images/faces/14.jpg';
import face15 from '../../../../assets/images/faces/15.jpg';


//Avatars
interface AvatarType {
    id: number;
    class: string;
    src: string;
}
export const Avatardata: AvatarType[] = [
    { id: 1, class: "avatar-radius-0", src: face1 },
    { id: 1, class: "", src: face2 },
    { id: 1, class: "avatar-rounded", src: face3 },
]

interface Icontype {
    id: number;
    class: string;
    src: string;
    icon: string;
    class1: string;
    height:number;
    width:number;
}
export const Avataricon: Icontype[] = [
    { id: 1, class: "xs", src: face2, icon: "camera", class1: "success", height:20, width:20},
    { id: 2, class: "sm", src: face3, icon: "edit", class1: "secondary", height:28, width:28},
    { id: 3, class: "md", src: face14, icon: "plus", class1: "warning", height:40, width:40},
    { id: 4, class: "lg", src: face13, icon: "edit", class1: "info", height:48, width:48},
    { id: 5, class: "xl", src: face15, icon: "camera", class1: "success", height:64, width:64},
    { id: 6, class: "xxl", src: face9, icon: "plus", class1: "danger", height:80, width:80},
]

//Avatar Sizes
export const Avatarsize = [
    { id: 1, class: "xs", src: face4, height:20, width:20 },
    { id: 2, class: "sm", src: face5, height:28, width:28 },
    { id: 3, class: "md", src: face6, height:40, width:40 },
    { id: 4, class: "lg", src: face7 , height:48, width:48},
    { id: 5, class: "xl", src: face8 , height:64, width:64},
    { id: 6, class: "xxl", src: face9 , height:80, width:80},
]

//Avatar With Online
export const Avataronline = [
    { id: 1, class: "xs online", src: face8, height:20, width:20 },
    { id: 2, class: "sm online", src: face10, height:28, width:28 },
    { id: 3, class: "md online", src: face12, height:40, width:40 },
    { id: 4, class: "lg online", src: face13, height:48, width:48 },
    { id: 5, class: "xl online", src: face14, height:64, width:64 },
    { id: 6, class: "xxl online", src: face15, height:80, width:80 },
]

//Avatar With Offline
export const Avataroffline = [
    { id: 1, class: "xs offline", src: face2, height:20, width:20 },
    { id: 2, class: "sm offline", src: face3, height:28, width:28 },
    { id: 3, class: "md offline", src: face4, height:40, width:40 },
    { id: 4, class: "lg offline", src: face5, height:48, width:48 },
    { id: 5, class: "xl offline", src: face6 , height:64, width:64},
    { id: 6, class: "xxl offline", src: face7, height:80, width:80 },
]

//Avatars With Number
export const Avatarnumber = [
    { id: 1, class: "xs", src: face2, icon: "camera", class1: "primary", data: '2' , height:20, width:20},
    { id: 2, class: "sm", src: face3, icon: "edit", class1: "secondary", data: '5', height:28, width:28 },
    { id: 3, class: "md", src: face14, icon: "plus", class1: "warning", data: '1', height:40, width:40 },
    { id: 4, class: "lg", src: face13, icon: "edit", class1: "info", data: '7', height:48, width:48 },
    { id: 5, class: "xl", src: face15, icon: "camera", class1: "success", data: '3', height:64, width:64 },
    { id: 6, class: "xxl", src: face9, icon: "plus", class1: "danger", data: '9', height:80, width:80 },
]

//Avatars With Number
interface StackType {
    id: number;
    src: string;
}
export const Avatarstack: StackType[] = [
    { id: 1, src: face2 },
    { id: 2, src: face8 },
    { id: 3, src: face2 },
    { id: 4, src: face10 },
    { id: 5, src: face4 },
    { id: 6, src: face13 },
]

//Avatar With Initials
interface InitialType {
    id: number;
    data: string;
    color: string;
    data1: string;
    height:number;
    width:number
}
export const Avatarinitial: InitialType[] = [
    { id: 1, data: "xs", color: "primary", data1: "XS" , height:20, width:20},
    { id: 2, data: "sm", color: "secondary", data1: "SM" , height:28, width:28},
    { id: 3, data: "md", color: "warning", data1: "MD" , height:40, width:40},
    { id: 4, data: "lg", color: "danger", data1: "LG" , height:48, width:48},
    { id: 5, data: "xl", color: "success", data1: "XL", height:64, width:64 },
    { id: 6, data: "xxl", color: "info", data1: "XXL", height:80, width:80 },
]