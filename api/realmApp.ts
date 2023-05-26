import Realm from 'realm';
import { environment } from './environment';

export const RealmApp = new Realm.App({ id: environment.realm.appId });