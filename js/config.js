
//#region configuration
const HEREInitials = {
    Messages: {
        NoImplemntation: 'WaliedCheetos says Hollla - Nothing implemented yet!',
    },
    Center: {
        lat: 25.19893,
        lng: 55.27991,
        text: 'WaliedCheetos'
    },
    MapTileStyle_Default: 'reduced.night',
    MapTileStyles: {
        ReducedNight: 'reduced.night',
        NormalDay: 'normal.day',
        NormalDayGrey: 'normal.day.grey',
        NormalDayTransit: 'normal.day.transit',
        ReducedDay: 'reduced.day',
        NormalNight: 'normal.night',
        ReducedNight: 'reduced.night',
        PedestrianDay: 'pedestrian.day'
    },
    //MapTileURLSuffix: `https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${HEREInitials.MapTileStyle.ReducedDay}/{z}/{x}/{y}/512/png8?apiKey=${HEREInitials.Credentials.APIKey}&ppi=320`,
    MapTileURLSuffix: 'https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest',
    HEREVectorTileURLSuffix: 'https://assets.vector.hereapi.com/styles/berlin/base/tangram/tilezen',

    Zoom: 17,
    Heading: 180,
    Tilt: 65,
    Credentials: {
        AppID: 'Lrw0yF4Z4nFpEe7jJxcd',
        AppCode: '9zhfUoi6kIHQqt85SunXuw',
        APIKey: 'pmYeJOpIGhJHSyyizwSKKPJoAHdjJ_bj12yfckgiT4E'
    },
    Attribution: '&copy; HERE 2020'
}

//#endregion

const What3WordsInitials = {
    Credentials: {
        APIKey: 'MMFFK8O1'
    },
    RegEx: {
        w3wFormat: /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i
    }
}

const AWSInitials = {
    APIGateways: {
        HEREw3w: 'https://ul1u2ghdfl.execute-api.us-east-1.amazonaws.com/prod/here-w3w'
    }
}

export { HEREInitials, What3WordsInitials, AWSInitials};