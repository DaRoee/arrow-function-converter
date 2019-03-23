[1, 2, 3].map(x => x * 2);
		[1, 2, 3].map(x => x * 2);

const headFunc = function() {
  const func = [1, 2, 3].map(x => () => x * 2);
};

const headFunc2 = function() {
  const func = [1, 2, 3].map(x => x * 2);
};

Promise.reject("")
	.then(res => res.json())
	
	.then(attr => ({ data: { id: userId, attr } }));

this.firstFunc().pipe(tap(x => this.secondFunc({ x })))

this.firstFunc().pipe(
	tap(x => this.secondFunc({ x })),
	action => this.store.dispatch(action),
	debounceTime(1000)
)

this.sum = this.someArr.reduce((sum, item) => sum + item, 0);

const func = [1, 2, 3].map(x => Person(`Person ${x}`));
