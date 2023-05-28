/*
 * WARNING: The exact names of these schemas, models, and collections matter
 */

export const importedSchemas = [
    'DB3Master',
    'KBankChain',
    'KCategory',
    'KContentPath',
    'KMode',
    'KSoundInfoCategory',
    'KSoundInfoMode',
    'KSoundInfo',
    'PSoundInfoEffect2',
    'PSoundInfoInstrument2',
    'PSoundInfoLoop2',
    'PSoundInfoOneshot2'
];

export const importedCollections = [
    'db3_master',
    'k_bank_chain',
    'k_category',
    'k_content_path',
    'k_mode',
    'k_sound_info_category',
    'k_sound_info_mode',
    'k_sound_info',
    'p_sound_info_Effect_2',
    'p_sound_info_instrument_2',
    'p_sound_info_Loop_2',
    'p_sound_info_Oneshot_2',
];

export const commonSchemas = [
    'Section',
    'Sound',
    'SoundStorm',
    'Story',
    'User',
    'Vendor'
];

export const commonCollections = [
    'sections',
    'sounds',
    'soundstorms',
    'stories',
    'users',
    'vendors'
];

export const allSchemas = [...importedSchemas, ...commonSchemas] as const;
export const allCollections = [...importedCollections, ...commonCollections] as const;
export const collectionNamesByName: { [key in typeof allSchemas[number]]: string } = {
    'DB3Master': 'db3_master',
    'KBankChain': 'k_bank_chain',
    'KCategory': 'k_category',
    'KContentPath': 'k_content_path',
    'KMode': 'k_mode',
    'KSoundInfoCategory': 'k_sound_info_category',
    'KSoundInfoMode': 'k_sound_info_mode',
    'KSoundInfo': 'k_sound_info',
    'PSoundInfoEffect2': 'p_sound_info_Effect_2',
    'PSoundInfoInstrument2': 'p_sound_info_instrument_2',
    'PSoundInfoLoop2': 'p_sound_info_Loop_2',
    'PSoundInfoOneshot2': 'p_sound_info_Oneshot_2',
    'Section': 'sections',
    'Sound': 'sounds',
    'SoundStorm': 'soundstorms',
    'Story': 'stories',
    'User': 'users',
    'Vendor': 'vendors'
}

export type ImportedSchema = typeof importedSchemas[number];
export type ImportedCollection = typeof importedCollections[number];
export type CommonSchema = typeof commonSchemas[number];
export type CommonCollection = typeof commonCollections[number];
export type AllSchema = typeof allSchemas[number];