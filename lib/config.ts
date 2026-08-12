export type Player={id:string;name:string;team:string;logo:string;photo:string;app:number;g:number;a:number};
export type Goalkeeper={id:string;name:string;team:string;logo?:string;photo?:string;app:number;cleanSheets:number;conceded:number};
export const players:Player[]=[
    {id:'mohammed-el-baadi',name:'Mohammed El Baadi',team:'House Stark FC',logo:'/logos/house-stark.png',photo:'/players/mohammed-el-baadi.jpg',app:5,g:29,a:14},
{id:'idder-bouram',name:'Idder Bouram',team:'FC Chiyet',logo:'/logos/fc-chiyet.png',photo:'/players/idder-bouram.png',app:5,g:15,a:17},
{id:'hamza-boudar',name:'Hamza Boudar',team:'São Paulo FC',logo:'/logos/spfc.png',photo:'/players/hamza-boudar.jpg',app:5,g:5,a:7},
{id:'rachid-boutaikhar',name:'Rachid Boutaikhar',team:'FC Chiyet',logo:'/logos/fc-chiyet.png',photo:'/players/rachid-boutaikhar.png',app:5,g:24,a:9},
{id:'hamza-rami',name:'Hamza Rami',team:'São Paulo FC',logo:'/logos/spfc.png',photo:'/players/hamza-rami.png',app:5,g:10,a:9},
{id:'yassine-el-ghazali',name:'Yassine El Ghazali',team:'House Stark FC',logo:'/logos/house-stark.png',photo:'/players/yassine-el-ghazali.png',app:5,g:13,a:12},
{id:'khalid-bouychou', name:'Khalid Bouychou',team:'FC Chiyet',logo:'/logos/fc-chiyet.png',photo:'/players/khalid-bouychou.png',app:3,g:8,a:6},
{id:'abdelillah-chemlal',name:'Abdelilah Chemlal',team:'House Stark FC',logo:'/logos/house-stark.png',photo:'/players/abdelillah-chemlal.png',app:5,g:7,a:6},
{id:'abdoulnacer',name:'Abdoul Nasser Tinni',team:'FC Chiyet',logo:'/logos/fc-chiyet.png',photo:'/players/abdoulnacer.png',app:5,g:11,a:7},
{id:'mohammed-radouani',name:'Mohammed Radouani',team:'São Paulo FC',logo:'/logos/spfc.png',photo:'/players/mohammed-radouani.png',app:5,g:15,a:3},
];
export const goalkeepers:Goalkeeper[]=[
    {id:'nourddine-ouahidi',name:'Nour Eddine Ouahidi',team:'FC Chiyet',logo:'/logos/fc-chiyet.png',photo:'/players/ouahidi.png',app:5,cleanSheets:2,conceded:11},
    {id:'ismail-lahrib',name:'Ismail Larhrib',team:'House Stark FC',logo:'/logos/house-stark.png',photo:'/players/ismail.png',app:5,cleanSheets:0,conceded:21},
    {id:'boubaker',name:'Aboubaker Jarboua',team:'Bocaliens',logo:'/logos/bocaliens.png',photo:'/players/boubaker.png',app:3,cleanSheets:0,conceded:15},
    {id:'ilias',name:'Ilias',team:'Leet Foot',logo:'/logos/leet.png',photo:'/players/ilias.png',app:3,cleanSheets:0,conceded:26},
];
export const adminLogins=()=> (process.env.ADMIN_LOGINS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
