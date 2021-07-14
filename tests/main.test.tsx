import * as React from 'react';
import {Family, Person, Preference} from "./family";
import { render, screen} from '@testing-library/react';
import {setLogLevel, memoizeObject, proxy} from "../src/index";
import "@testing-library/jest-dom/extend-expect";
import {useObservable, useObservables} from "../src/reactUse";

setLogLevel({});

export class FamilyContext {
    constructor(family : Family) {
        this.family = family
    }
    family : Family;
    currentMemberIx: number = 0;
    get member () {return this.family.members[this.currentMemberIx]};
}

test( 'memoizer', () => {

    let calculations = 0;

//We can beef up our module by adding functions later
    const memo = (fn : any) => {
        let cache : any = {};
        return (...args : any) => {
            let n = args[0];  // just taking one argument here
            if (n in cache) {
                return cache[n];
            }
            else {
                let result = fn(n);
                cache[n] = result;
                return result;
            }
        }
    }
    type F = (...args: any[])=>void;
    var sqrt : F = memo(function(n : number, a : number) {
        ++calculations;
        return Math.sqrt(n + a);
    });

    sqrt(1, 1);
    sqrt(2, 1);
    sqrt(3, 1);
    sqrt(2, 1);
    sqrt(2, 2);
    expect(calculations).toBe(3);

    var sqrt2 : F = memo(function(n : number, a : number) {
        ++calculations;
        return Math.sqrt(n + a);
    });

    sqrt2(1, 1);
    sqrt2(2, 1);
    sqrt2(3, 1);
    sqrt2(2, 1);
    expect(calculations).toBe(6)
});

test('can render names', async () => {

    const family = proxy(new Family({members: [
            new Person({name: "Sam"}),
            new Person({name: "Karen", age: 53, preferences: [new Preference({name: "food", value: 1})]})
        ]}));
    memoizeObject(family, 'getSortedMembers');
    const renderCount : any = {C0: 0, C1: 0, C2: 0, P: 0};

    const PersonComponent = React.memo(({person, id} : {person: Person, id : number}) => {
        useObservables();
        const [name, setName] = useObservable(person.name);
        renderCount['C' + id]++;
        return (
            <>
                <div data-testid={'P' + id}>{person.nameGetter}</div>
                <div data-testid={'B' + id} onClick={() => setName(name.toLowerCase())}>Lower</div>
            </>
        );
    });
    function App () {
        useObservables()
        renderCount['P']++;
        const {members, sortedMembers, getSortedMembers} = family;
        return  (
            <div>
                {members.map((person, ix) =>
                    <PersonComponent key={ix} person={person} id={ix}/>
                )}
                <PersonComponent person={members[0]}  id={2}/>

                {sortedMembers.map((person, ix) =>
                    <div key={ix}>{person.name}</div>
                )}
                {sortedMembers.map((person, ix) =>
                    <div key={ix}>{person.name}</div>
                )}

                {getSortedMembers(false, false).map((person, ix) =>
                    <div key={ix}>{person.name}</div>
                )}
                {getSortedMembers(false, false).map((person, ix) =>
                    <div key={ix}>{person.name}</div>
                )}
                {getSortedMembers(false, true).map((person, ix) =>
                    <div key={ix}>{person.name}</div>
                )}
            </div>
        );
    }
    /*
    class LOC extends Component<any, any> {
        render() {
            return (<div></div>);
        }
    }
    function passProps(obj: any, callback: (f:any) => any) : any {
        const res : any = {};
        const p = new Proxy(obj, {get (t, p) {res[p] = t[p]}});
        callback(obj);
        return res;
    };
    function HOC () {
        const props = passProps(family, (f) => [f.members]);
        return (<LOC {...props} />);
    }
    */
    render(<App />);

    expect (screen.getByTestId('P0')).toHaveTextContent("Sam");
    expect (screen.getByTestId('P1')).toHaveTextContent("Karen");
    expect (screen.getByTestId('P2')).toHaveTextContent("Sam");

    screen.getByTestId('B0').click();

    expect (await screen.getByTestId('P0')).toHaveTextContent("sam");
    expect (screen.getByTestId('P1')).toHaveTextContent("Karen");
    expect (await screen.getByTestId('P2')).toHaveTextContent("sam");

    expect (Family.sorts).toBe(2); // Changing the name to lower case
    expect (Family.sortFunctions).toBe(4); // Changing the name to lower case


    // P: Parent renders twice, once at start and once becuase of members
    // C0: Renders twice, the second time because of name (not because of props since Person ref unchanged)
    // C1: Should only render once even though parent renders it is memoed and Person ref unchanged
    // C2: Renders twice, the second time because of name which was changed in C0
    expect(JSON.stringify(renderCount)).toEqual(JSON.stringify({C0: 2, C1: 1, C2: 2, P: 2})); // P should be 2 but app rendered twice
    /*
      const f = family as any;
      expect(f.__proxies__.size).toBe(1);
      expect(f.__proxies__.get(Array.from(f.__proxies__.keys())[0]).__target__).toBe(f);
      const m0 = f.members[0];
      const m1 = f.members[1];
      expect(m0.__parents__.size).toBe(1);
      const m0Parent = m0.__parents__.get(Array.from(m0.__parents__.keys())[0]);
      expect (m0Parent.prop).toBe("0");
      expect (m0Parent.target instanceof Array).toBe(true);
      expect (m0Parent.target.__parents__.size).toBe(1);
      const fuck = m0Parent.target.__parents__.get(f);
      expect (m0Parent.target.__parents__.get(f).target).toBe(f);

      await unmount();

      expect(f.__proxies__.size).toBe(0);
      expect(f.members[0].__proxies__.size).toBe(0);
      expect(f.members[1].__proxies__.size).toBe(0);
    */
});
/*
test('classes function on their own', () => {
  const f = new Family();
  f.members[0] = new Person({name: "Sam"});
  f.members.push(new Person({name: "Karen", age: 53, preferences: [new Preference({name: "food", value: 1})]}));
  const sam = f.member;
  f.currentMemberIx = 1;
  const karen = f.member;
  expect (karen.name).toBe("Karen")
  expect (karen.nameAndAge).toBe("Karen (53)");
  const fa = useCAPI<Family>(f, logChanges);
  fa.members[1] = new Person({name: "Karen", age: 53});
  fa.members[1].name = "Karen Burke";
  expect(fa.members[1].name).toBe("Karen Burke");
  fa.currentMemberIx = 0;
  expect(fa.foo).toBe("foo");
  expect(fa.member.name).toBe("Sam");
});
*/
/*
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
 */
