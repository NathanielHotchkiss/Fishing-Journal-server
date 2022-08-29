INSERT INTO app_users (
    user_id,
    first_name, 
    last_name,
    email, 
    password,
) VALUES (
    'John',
    'Doe',
    '12345@gmail.com',
    '12345'
), (
    'Nathan',
    'Hotchkiss',
    'fake@gmail.com',
    'password'
);

INSERT INTO fishing_logs (
    user_id,
    species,
    fish_length,
    pounds,
    ounces,
    bait,
    fishing_method
) VALUES (
    1,
    'Largemouth Bass',
    '11',
    '5',
    '4',
    'Crank Bait',
    'Shore'
), (
    1,
    'Blue Catfish',
    '12',
    '6',
    '2',
    'Live',
    'Shore'
), (
    1,
    'Longnose Gar',
    '16',
    '7',
    '4',
    'Real',
    'Boat'
), (
    1,
    'Largemouth Bass',
    '13',
    '7',
    '3',
    'Poppers',
    'Shore'
), (
    1,
    'Smallmouth Bass',
    '6',
    '3',
    '2',
    'Crank Bait',
    'Shore'
), (
    1,
    'Largemouth Bass',
    '9',
    '5',
    '11',
    'Spinners',
    'Boat'
), (
    1,
    'Bluegill',
    '5',
    '2',
    '8',
    'Real',
    'Shore'
), (
    1,
    'Carp',
    '18',
    '14',
    '12',
    'Real',
    'Shore'
);

