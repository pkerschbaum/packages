export const observableUtils = {
  createObservable,
};

function createObservable<TValue>(initialValue: TValue) {
  let value = initialValue;
  let subscriptions: Array<(value: TValue) => void> = [];

  function getValue() {
    return value;
  }

  function setValue(newValue: TValue) {
    value = newValue;
    for (const subscription of subscriptions) {
      subscription(newValue);
    }
  }

  function subscribe(subscription: (value: TValue) => void) {
    subscriptions = [...subscriptions, subscription];
  }

  function unsubscribe(subscription: (value: TValue) => void) {
    subscriptions = subscriptions.filter(
      (testedSubscription) => testedSubscription !== subscription,
    );
  }

  return { getValue, setValue, subscribe, unsubscribe };
}
