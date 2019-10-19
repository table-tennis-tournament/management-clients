import {Match} from '../../shared/data/match.model';

export const OneMatch: Match [] = [
    {
        'id': 1,
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
        ],
        'state': 'Open',
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
    }
];
