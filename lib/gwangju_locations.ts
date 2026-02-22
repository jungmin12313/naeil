export interface LocationData {
    name: string;
    lat: number;
    lng: number;
}

export interface DistrictData {
    name: string;
    neighborhoods: LocationData[];
}

export const GWANGJU_LOCATIONS: DistrictData[] = [
    {
        name: "북구",
        neighborhoods: [
            { name: "용봉동", lat: 35.1765, lng: 126.9135 },
            { name: "중흥동", lat: 35.1689, lng: 126.9132 },
            { name: "우산동", lat: 35.1732, lng: 126.9245 },
            { name: "풍향동", lat: 35.1654, lng: 126.9212 },
            { name: "문흥동", lat: 35.1885, lng: 126.9338 },
            { name: "두암동", lat: 35.1705, lng: 126.9358 },
            { name: "삼각동", lat: 35.1956, lng: 126.9158 },
            { name: "일곡동", lat: 35.2032, lng: 126.9065 },
            { name: "매곡동", lat: 35.1952, lng: 126.9032 },
            { name: "오치동", lat: 35.1852, lng: 126.9201 },
            { name: "석곡동", lat: 35.2149, lng: 126.9499 },
            { name: "건국동", lat: 35.2154, lng: 126.8721 },
            { name: "운암동", lat: 35.1789, lng: 126.8921 },
            { name: "동림동", lat: 35.1834, lng: 126.8795 },
            { name: "양산동", lat: 35.2085, lng: 126.8854 },
            { name: "신용동", lat: 35.2123, lng: 126.8654 }
        ]
    },
    {
        name: "동구",
        neighborhoods: [
            { name: "충장동", lat: 35.1461, lng: 126.9230 },
            { name: "동명동", lat: 35.1493, lng: 126.9244 },
            { name: "계림동", lat: 35.1567, lng: 126.9215 },
            { name: "산수동", lat: 35.1566, lng: 126.9339 },
            { name: "지산동", lat: 35.1456, lng: 126.9389 },
            { name: "서남동", lat: 35.1423, lng: 126.9198 },
            { name: "학동", lat: 35.1311, lng: 126.9263 },
            { name: "학운동", lat: 35.1289, lng: 126.9345 },
            { name: "지원동", lat: 35.1154, lng: 126.9387 }
        ]
    },
    {
        name: "서구",
        neighborhoods: [
            { name: "양동", lat: 35.1523, lng: 126.9034 },
            { name: "농성동", lat: 35.1554, lng: 126.8923 },
            { name: "광천동", lat: 35.1602, lng: 126.8845 },
            { name: "유덕동", lat: 35.1623, lng: 126.8654 },
            { name: "치평동", lat: 35.1601, lng: 126.8514 },
            { name: "상무동", lat: 35.1565, lng: 126.8532 },
            { name: "화정동", lat: 35.1455, lng: 126.8477 },
            { name: "서창동", lat: 35.1154, lng: 126.8321 },
            { name: "금호동", lat: 35.1389, lng: 126.8621 },
            { name: "풍암동", lat: 35.1183, lng: 126.8672 },
            { name: "동천동", lat: 35.1687, lng: 126.8689 }
        ]
    },
    {
        name: "남구",
        neighborhoods: [
            { name: "양림동", lat: 35.1386, lng: 126.9124 },
            { name: "방림동", lat: 35.1354, lng: 126.9187 },
            { name: "봉선동", lat: 35.1234, lng: 126.9131 },
            { name: "사직동", lat: 35.1412, lng: 126.9101 },
            { name: "월산동", lat: 35.1432, lng: 126.8978 },
            { name: "백운동", lat: 35.1365, lng: 126.9056 },
            { name: "주월동", lat: 35.1321, lng: 126.8987 },
            { name: "효덕동", lat: 35.1123, lng: 126.8956 },
            { name: "진월동", lat: 35.1189, lng: 126.9023 },
            { name: "송암동", lat: 35.1154, lng: 126.8832 },
            { name: "대촌동", lat: 35.0854, lng: 126.8732 }
        ]
    },
    {
        name: "광산구",
        neighborhoods: [
            { name: "송정동", lat: 35.1389, lng: 126.7956 },
            { name: "도산동", lat: 35.1321, lng: 126.7895 },
            { name: "신흥동", lat: 35.1354, lng: 126.8054 },
            { name: "어룡동", lat: 35.1456, lng: 126.7989 },
            { name: "우산동", lat: 35.1589, lng: 126.8123 },
            { name: "월곡동", lat: 35.1654, lng: 126.8289 },
            { name: "비아동", lat: 35.2254, lng: 126.8256 },
            { name: "첨단동", lat: 35.2222, lng: 126.8244 },
            { name: "신가동", lat: 35.1856, lng: 126.8354 },
            { name: "운남동", lat: 35.1789, lng: 126.8245 },
            { name: "수완동", lat: 35.1912, lng: 126.8256 },
            { name: "하남동", lat: 35.1915, lng: 126.7929 },
            { name: "신창동", lat: 35.1956, lng: 126.8489 },
            { name: "임곡동", lat: 35.2154, lng: 126.7456 },
            { name: "동곡동", lat: 35.1154, lng: 126.7654 },
            { name: "평동", lat: 35.1254, lng: 126.7556 },
            { name: "삼도동", lat: 35.1354, lng: 126.7056 },
            { name: "본량동", lat: 35.2054, lng: 126.7156 }
        ]
    }
];
