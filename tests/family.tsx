
import {memoizeClass} from "../src/index";

let id = 1;
export class Preference {

    constructor(preference ?: Partial<Preference>) {
        Object.assign(this, preference || {});
    }
    name = "";
    value = 0;
    setP1 (p1: string) {this.name = p1};
    setP2 (p2: number) {this.value = p2};
    get all () : string {return this.name + this.value};
    setAll (p1: string, p2: number) {this.setP1(p1);this.setP2(p2)};
}

export class Person {

    name = "";
    age = 0;
    id;
    readonly preferences = new Array<Preference>();

    constructor (person ? : Partial<Person>) {
        this.id = id++;
        if (person) {
            Object.assign(this, person || {});
        }
    }
    get nameGetter () : string { return this.name };
    get nameAndAge (): string {
        return this.name + " (" + this.age + ")";
    };

    setAgeAndName (name: string, age: number): void {
        this.name = name;
        this.age = age;
    };

    // Reference to spec will be provide at runtime based on mount spec any typescript friend def will do
    get preference () : Preference {return this.preferences[this.currentPreferenceIx]};
    currentPreferenceIx : number = 0;

    // Will add preference to end
    addPreference (preference : Partial<Preference>) {
        this.preferences.push(new Preference(preference));
        this.currentPreferenceIx = this.preferences.values.length - 1;
    }
}

export class Family {
    constructor (family ? : Partial<Family>) {
        this.id = ++id;
        if (family) {
            Object.assign(this, family || {});
        }
    }
    id;
    members = new Array<Person>();
    static sorts = 0;
    static sortFunctions = 0;
    get sortedMembers  () {
        ++Family.sorts;
        return this.members.slice(0).sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
    }
    getSortedMembers (ascending : boolean, caseInsensitive : boolean) {
        ++Family.sortFunctions;
        return this.members.slice(0).sort((a, b) => {
            const aname = caseInsensitive ? a.name.toLowerCase() :a.name;
            const bname = caseInsensitive ? b.name.toLowerCase() : b.name;
            return ascending ?
                (aname > bname ? 1 : aname < bname ? -1 : 0) :
                (aname > bname ? -1 : aname < bname ? 1 : 0)
        })
    }
    currentMemberIx: number = 0;
    get member () {return this.members[this.currentMemberIx]};
    get foo ()  {return "foo"}
    date = new Date();
}
memoizeClass(Family, 'sortedMembers');

