export const testPlayers = [{
    'id': 278,
    'firstName': 'Dirk',
    'lastName': 'Butz',
    'ttr': 1715,
    'sex': 'M',
    'club': {
        'id': 5,
        'clubName': 'TTV Albersweiler'
    },
    'hasMatches': false,
    'types': []
},
    {
        'id': 279,
        'firstName': 'Christoph',
        'lastName': 'Gau',
        'ttr': 1767,
        'sex': 'M',
        'club': {
            'id': 10,
            'clubName': 'TTV Ettlingen'
        },
        'hasMatches': false,
        'types': []
    }];

export const testAggregate = [{
    'name': 'Gruppenspiel 01 ',
    'startTime': '19/01/2019 16:13:21',
    'tableNumbers': [6],
    'discipline': {'id': 7, 'name': 'Herren C', 'kind': 1, 'active': true},
    'players': [{
        'id': 206,
        'firstName': 'Martin',
        'lastName': 'Sebald',
        'ttr': 1484,
        'sex': 'M',
        'club': {'id': 41, 'clubName': 'TTV Zell'},
        'hasMatches': true,
        'types': [7, 1]
    }, {
        'id': 76,
        'firstName': 'Frank',
        'lastName': 'Jänicke',
        'ttr': 1696,
        'sex': 'M',
        'club': {'id': 38, 'clubName': 'TTV Weinheim-West'},
        'hasMatches': true,
        'types': [7]
    }, {
        'id': 177,
        'firstName': 'Anton',
        'lastName': 'Kirsamer',
        'ttr': 1489,
        'sex': 'M',
        'club': {'id': 7, 'clubName': 'TTV Bühlertal'},
        'hasMatches': true,
        'types': [7]
    }],
    'matches': [{
        'id': 129,
        'startTime': '19/01/2019 16:13:21',
        'result': null,
        'team1': [{
            'id': 206,
            'firstName': 'Martin',
            'lastName': 'Sebald',
            'ttr': 1484,
            'sex': 'M',
            'club': {'id': 41, 'clubName': 'TTV Zell'},
            'hasMatches': true,
            'types': [7, 1]
        }],
        'team2': [{
            'id': 76,
            'firstName': 'Frank',
            'lastName': 'Jänicke',
            'ttr': 1696,
            'sex': 'M',
            'club': {'id': 38, 'clubName': 'TTV Weinheim-West'},
            'hasMatches': true,
            'types': [7]
        }],
        'matchType': {'id': 9, 'name': 'Gruppenspiel'},
        'type': {'id': 7, 'name': 'Herren C', 'kind': 1, 'active': true},
        'group': {'id': 1, 'name': '01 '},
        'isPlayable': false,
        'state': 'Callable',
        'table': [6]
    }, {
        'id': 130,
        'startTime': '19/01/2019 16:13:21',
        'result': null,
        'team1': [{
            'id': 177,
            'firstName': 'Anton',
            'lastName': 'Kirsamer',
            'ttr': 1489,
            'sex': 'M',
            'club': {'id': 7, 'clubName': 'TTV Bühlertal'},
            'hasMatches': true,
            'types': [7]
        }],
        'team2': [{
            'id': 76,
            'firstName': 'Frank',
            'lastName': 'Jänicke',
            'ttr': 1696,
            'sex': 'M',
            'club': {'id': 38, 'clubName': 'TTV Weinheim-West'},
            'hasMatches': true,
            'types': [7]
        }],
        'matchType': {'id': 9, 'name': 'Gruppenspiel'},
        'type': {'id': 7, 'name': 'Herren C', 'kind': 1, 'active': true},
        'group': {'id': 1, 'name': '01 '},
        'isPlayable': false,
        'state': 'Callable',
        'table': [6]
    }]
}];
