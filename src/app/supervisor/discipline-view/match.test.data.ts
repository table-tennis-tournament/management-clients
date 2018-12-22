import {Match} from '../../shared/data/match.model';
import {Discipline} from '../../discipline/discipline.model';

export const ThreeMatches: Match[] = [
    {
        'match': {
            'id': 1,
            'startTime': -2209165200000,
            'isPlayed': true,
            'result': [
                [
                    11,
                    5
                ],
                [
                    11,
                    5
                ],
                [
                    11,
                    5
                ]
            ]
        },
        'team1': [
            {
                'id': 272,
                'firstName': 'Karlheinz',
                'lastName': 'Barry',
                'ttr': 1086,
                'sex': 'M',
                'club': {
                    'id': 5,
                    'clubName': 'TTV Albersweiler'
                },
                'hasMatches': false,
                'types': []
            }
        ],
        'team2': [
            {
                'id': 55,
                'firstName': 'Thomas',
                'lastName': 'Bauer',
                'ttr': 1269,
                'sex': 'M',
                'club': {
                    'id': 7,
                    'clubName': 'TG Aue 1895'
                },
                'hasMatches': true,
                'types': [
                    2
                ]
            }
        ],
        'matchType': {
            'id': 9,
            'name': 'Gruppenspiel'
        },
        'type': {
            'id': 1,
            'name': 'Herren D 0-1500',
            'kind': 1,
            'active': true
        },
        'group': {
            'id': 1,
            'name': '01 '
        },
        'isPlayable': true,
        'isInWaitingList': false,
        'table': []
    },
    {
        'match': {
            'id': 2,
            'startTime': -2209165200000,
            'isPlayed': true,
            'result': [
                [
                    11,
                    5
                ],
                [
                    11,
                    5
                ],
                [
                    11,
                    5
                ]
            ]
        },
        'team1': [
            {
                'id': 272,
                'firstName': 'Karlheinz',
                'lastName': 'Barry',
                'ttr': 1086,
                'sex': 'M',
                'club': {
                    'id': 5,
                    'clubName': 'TTV Albersweiler'
                },
                'hasMatches': false,
                'types': []
            }
        ],
        'team2': [
            {
                'id': 185,
                'firstName': 'Richard',
                'lastName': 'Dingeldein',
                'ttr': 1500,
                'sex': 'M',
                'club': {
                    'id': 15,
                    'clubName': 'VfR Fehlheim 1929'
                },
                'hasMatches': true,
                'types': [
                    1
                ]
            }
        ],
        'matchType': {
            'id': 9,
            'name': 'Gruppenspiel'
        },
        'type': {
            'id': 1,
            'name': 'Herren D 0-1500',
            'kind': 1,
            'active': true
        },
        'group': {
            'id': 1,
            'name': '01 '
        },
        'isPlayable': true,
        'isInWaitingList': false,
        'table': []
    },
    {
        'match': {
            'id': 3,
            'startTime': -2209165200000,
            'isPlayed': true,
            'result': [
                [
                    11,
                    5
                ],
                [
                    11,
                    5
                ],
                [
                    11,
                    5
                ]
            ]
        },
        'team1': [
            {
                'id': 55,
                'firstName': 'Thomas',
                'lastName': 'Bauer',
                'ttr': 1269,
                'sex': 'M',
                'club': {
                    'id': 7,
                    'clubName': 'TG Aue 1895'
                },
                'hasMatches': true,
                'types': [
                    2
                ]
            }
        ],
        'team2': [
            {
                'id': 185,
                'firstName': 'Richard',
                'lastName': 'Dingeldein',
                'ttr': 1500,
                'sex': 'M',
                'club': {
                    'id': 15,
                    'clubName': 'VfR Fehlheim 1929'
                },
                'hasMatches': true,
                'types': [
                    1
                ]
            }
        ],
        'matchType': {
            'id': 9,
            'name': 'Gruppenspiel'
        },
        'type': {
            'id': 1,
            'name': 'Herren D 0-1500',
            'kind': 1,
            'active': true
        },
        'group': {
            'id': 1,
            'name': '01 '
        },
        'isPlayable': true,
        'isInWaitingList': false,
        'table': []
    }
];

export const TenDisciplines: Discipline[] = [{'id': 5, 'name': 'Damen A', 'kind': 1, 'active': false}, {
    'id': 6,
    'name': 'Damen A',
    'kind': 2,
    'active': false
}, {'id': 9, 'name': 'Herren A', 'kind': 1, 'active': false}, {'id': 10, 'name': 'Herren A', 'kind': 2, 'active': false}, {
    'id': 3,
    'name': 'Herren B 1701-1900',
    'kind': 1,
    'active': true
}, {'id': 4, 'name': 'Herren B 1701-1900', 'kind': 2, 'active': true}, {
    'id': 7,
    'name': 'Herren C 1501-1700',
    'kind': 1,
    'active': true
}, {'id': 8, 'name': 'Herren C 1501-1700', 'kind': 2, 'active': true}, {
    'id': 1,
    'name': 'Herren D 0-1500',
    'kind': 1,
    'active': true
}, {'id': 2, 'name': 'Herren D 0-1500', 'kind': 2, 'active': true}];
