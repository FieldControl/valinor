import { ApolloError, } from '@apollo/client/core';
const isApolloError = (err) => err && err.hasOwnProperty('graphQLErrors');
export class TestOperation {
    constructor(operation, observer) {
        this.operation = operation;
        this.observer = observer;
    }
    flush(result) {
        if (isApolloError(result)) {
            this.observer.error(result);
        }
        else {
            const fetchResult = result ? { ...result } : result;
            this.observer.next(fetchResult);
            this.observer.complete();
        }
    }
    flushData(data) {
        this.flush({
            data,
        });
    }
    networkError(error) {
        const apolloError = new ApolloError({
            networkError: error,
        });
        this.flush(apolloError);
    }
    graphqlErrors(errors) {
        this.flush({
            errors,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlcmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdGluZy9zcmMvb3BlcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxXQUFXLEdBR1osTUFBTSxxQkFBcUIsQ0FBQztBQUk3QixNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQVEsRUFBc0IsRUFBRSxDQUNyRCxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQU03QyxNQUFNLE9BQU8sYUFBYTtJQUN4QixZQUNTLFNBQW9CLEVBQ25CLFFBQWtDO1FBRG5DLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDbkIsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7SUFDekMsQ0FBQztJQUVHLEtBQUssQ0FBQyxNQUFxQztRQUNoRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QjthQUFNO1lBQ0wsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsTUFBTSxFQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFrQixDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFFTSxTQUFTLENBQUMsSUFBaUM7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNULElBQUk7U0FDTCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sWUFBWSxDQUFDLEtBQVk7UUFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFDbEMsWUFBWSxFQUFFLEtBQUs7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sYUFBYSxDQUFDLE1BQXNCO1FBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDVCxNQUFNO1NBQ1AsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQXBvbGxvRXJyb3IsXG4gIE9wZXJhdGlvbiBhcyBMaW5rT3BlcmF0aW9uLFxuICBGZXRjaFJlc3VsdCxcbn0gZnJvbSAnQGFwb2xsby9jbGllbnQvY29yZSc7XG5pbXBvcnQge0dyYXBoUUxFcnJvciwgRXhlY3V0aW9uUmVzdWx0fSBmcm9tICdncmFwaHFsJztcbmltcG9ydCB7T2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5jb25zdCBpc0Fwb2xsb0Vycm9yID0gKGVycjogYW55KTogZXJyIGlzIEFwb2xsb0Vycm9yID0+XG4gIGVyciAmJiBlcnIuaGFzT3duUHJvcGVydHkoJ2dyYXBoUUxFcnJvcnMnKTtcblxuZXhwb3J0IHR5cGUgT3BlcmF0aW9uID0gTGlua09wZXJhdGlvbiAmIHtcbiAgY2xpZW50TmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIFRlc3RPcGVyYXRpb248VCA9IHtba2V5OiBzdHJpbmddOiBhbnl9PiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBvcGVyYXRpb246IE9wZXJhdGlvbixcbiAgICBwcml2YXRlIG9ic2VydmVyOiBPYnNlcnZlcjxGZXRjaFJlc3VsdDxUPj4sXG4gICkge31cblxuICBwdWJsaWMgZmx1c2gocmVzdWx0OiBFeGVjdXRpb25SZXN1bHQgfCBBcG9sbG9FcnJvcik6IHZvaWQge1xuICAgIGlmIChpc0Fwb2xsb0Vycm9yKHJlc3VsdCkpIHtcbiAgICAgIHRoaXMub2JzZXJ2ZXIuZXJyb3IocmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZmV0Y2hSZXN1bHQgPSByZXN1bHQgPyB7Li4ucmVzdWx0fSA6IHJlc3VsdDtcbiAgICAgIHRoaXMub2JzZXJ2ZXIubmV4dChmZXRjaFJlc3VsdCBhcyBhbnkpO1xuICAgICAgdGhpcy5vYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBmbHVzaERhdGEoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5mbHVzaCh7XG4gICAgICBkYXRhLFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG5ldHdvcmtFcnJvcihlcnJvcjogRXJyb3IpOiB2b2lkIHtcbiAgICBjb25zdCBhcG9sbG9FcnJvciA9IG5ldyBBcG9sbG9FcnJvcih7XG4gICAgICBuZXR3b3JrRXJyb3I6IGVycm9yLFxuICAgIH0pO1xuXG4gICAgdGhpcy5mbHVzaChhcG9sbG9FcnJvcik7XG4gIH1cblxuICBwdWJsaWMgZ3JhcGhxbEVycm9ycyhlcnJvcnM6IEdyYXBoUUxFcnJvcltdKTogdm9pZCB7XG4gICAgdGhpcy5mbHVzaCh7XG4gICAgICBlcnJvcnMsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==