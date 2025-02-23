
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model PasswordReset
 * 
 */
export type PasswordReset = $Result.DefaultSelection<Prisma.$PasswordResetPayload>
/**
 * Model MultiFactorAuthentication
 * 
 */
export type MultiFactorAuthentication = $Result.DefaultSelection<Prisma.$MultiFactorAuthenticationPayload>
/**
 * Model Passkey
 * 
 */
export type Passkey = $Result.DefaultSelection<Prisma.$PasskeyPayload>
/**
 * Model Totp
 * 
 */
export type Totp = $Result.DefaultSelection<Prisma.$TotpPayload>
/**
 * Model Course
 * 
 */
export type Course = $Result.DefaultSelection<Prisma.$CoursePayload>
/**
 * Model Lesson
 * 
 */
export type Lesson = $Result.DefaultSelection<Prisma.$LessonPayload>
/**
 * Model UserProgress
 * 
 */
export type UserProgress = $Result.DefaultSelection<Prisma.$UserProgressPayload>
/**
 * Model DeletionInfo
 * 
 */
export type DeletionInfo = $Result.DefaultSelection<Prisma.$DeletionInfoPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const TotpStatus: {
  DISABLED: 'DISABLED',
  PENDING: 'PENDING',
  ENABLED: 'ENABLED'
};

export type TotpStatus = (typeof TotpStatus)[keyof typeof TotpStatus]


export const DeletionStatus: {
  WAITING_FOR_VERIFICATION: 'WAITING_FOR_VERIFICATION',
  SCHEDULED: 'SCHEDULED',
  DELETED: 'DELETED'
};

export type DeletionStatus = (typeof DeletionStatus)[keyof typeof DeletionStatus]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type TotpStatus = $Enums.TotpStatus

export const TotpStatus: typeof $Enums.TotpStatus

export type DeletionStatus = $Enums.DeletionStatus

export const DeletionStatus: typeof $Enums.DeletionStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.passwordReset`: Exposes CRUD operations for the **PasswordReset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PasswordResets
    * const passwordResets = await prisma.passwordReset.findMany()
    * ```
    */
  get passwordReset(): Prisma.PasswordResetDelegate<ExtArgs>;

  /**
   * `prisma.multiFactorAuthentication`: Exposes CRUD operations for the **MultiFactorAuthentication** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MultiFactorAuthentications
    * const multiFactorAuthentications = await prisma.multiFactorAuthentication.findMany()
    * ```
    */
  get multiFactorAuthentication(): Prisma.MultiFactorAuthenticationDelegate<ExtArgs>;

  /**
   * `prisma.passkey`: Exposes CRUD operations for the **Passkey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Passkeys
    * const passkeys = await prisma.passkey.findMany()
    * ```
    */
  get passkey(): Prisma.PasskeyDelegate<ExtArgs>;

  /**
   * `prisma.totp`: Exposes CRUD operations for the **Totp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Totps
    * const totps = await prisma.totp.findMany()
    * ```
    */
  get totp(): Prisma.TotpDelegate<ExtArgs>;

  /**
   * `prisma.course`: Exposes CRUD operations for the **Course** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Courses
    * const courses = await prisma.course.findMany()
    * ```
    */
  get course(): Prisma.CourseDelegate<ExtArgs>;

  /**
   * `prisma.lesson`: Exposes CRUD operations for the **Lesson** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Lessons
    * const lessons = await prisma.lesson.findMany()
    * ```
    */
  get lesson(): Prisma.LessonDelegate<ExtArgs>;

  /**
   * `prisma.userProgress`: Exposes CRUD operations for the **UserProgress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProgresses
    * const userProgresses = await prisma.userProgress.findMany()
    * ```
    */
  get userProgress(): Prisma.UserProgressDelegate<ExtArgs>;

  /**
   * `prisma.deletionInfo`: Exposes CRUD operations for the **DeletionInfo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeletionInfos
    * const deletionInfos = await prisma.deletionInfo.findMany()
    * ```
    */
  get deletionInfo(): Prisma.DeletionInfoDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 34ace0eb2704183d2c05b60b52fba5c43c13f303
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    PasswordReset: 'PasswordReset',
    MultiFactorAuthentication: 'MultiFactorAuthentication',
    Passkey: 'Passkey',
    Totp: 'Totp',
    Course: 'Course',
    Lesson: 'Lesson',
    UserProgress: 'UserProgress',
    DeletionInfo: 'DeletionInfo'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "passwordReset" | "multiFactorAuthentication" | "passkey" | "totp" | "course" | "lesson" | "userProgress" | "deletionInfo"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      PasswordReset: {
        payload: Prisma.$PasswordResetPayload<ExtArgs>
        fields: Prisma.PasswordResetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PasswordResetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PasswordResetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          findFirst: {
            args: Prisma.PasswordResetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PasswordResetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          findMany: {
            args: Prisma.PasswordResetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>[]
          }
          create: {
            args: Prisma.PasswordResetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          createMany: {
            args: Prisma.PasswordResetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PasswordResetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>[]
          }
          delete: {
            args: Prisma.PasswordResetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          update: {
            args: Prisma.PasswordResetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          deleteMany: {
            args: Prisma.PasswordResetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PasswordResetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PasswordResetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          aggregate: {
            args: Prisma.PasswordResetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePasswordReset>
          }
          groupBy: {
            args: Prisma.PasswordResetGroupByArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetGroupByOutputType>[]
          }
          count: {
            args: Prisma.PasswordResetCountArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetCountAggregateOutputType> | number
          }
        }
      }
      MultiFactorAuthentication: {
        payload: Prisma.$MultiFactorAuthenticationPayload<ExtArgs>
        fields: Prisma.MultiFactorAuthenticationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MultiFactorAuthenticationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MultiFactorAuthenticationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>
          }
          findFirst: {
            args: Prisma.MultiFactorAuthenticationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MultiFactorAuthenticationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>
          }
          findMany: {
            args: Prisma.MultiFactorAuthenticationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>[]
          }
          create: {
            args: Prisma.MultiFactorAuthenticationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>
          }
          createMany: {
            args: Prisma.MultiFactorAuthenticationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MultiFactorAuthenticationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>[]
          }
          delete: {
            args: Prisma.MultiFactorAuthenticationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>
          }
          update: {
            args: Prisma.MultiFactorAuthenticationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>
          }
          deleteMany: {
            args: Prisma.MultiFactorAuthenticationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MultiFactorAuthenticationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MultiFactorAuthenticationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MultiFactorAuthenticationPayload>
          }
          aggregate: {
            args: Prisma.MultiFactorAuthenticationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMultiFactorAuthentication>
          }
          groupBy: {
            args: Prisma.MultiFactorAuthenticationGroupByArgs<ExtArgs>
            result: $Utils.Optional<MultiFactorAuthenticationGroupByOutputType>[]
          }
          count: {
            args: Prisma.MultiFactorAuthenticationCountArgs<ExtArgs>
            result: $Utils.Optional<MultiFactorAuthenticationCountAggregateOutputType> | number
          }
        }
      }
      Passkey: {
        payload: Prisma.$PasskeyPayload<ExtArgs>
        fields: Prisma.PasskeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PasskeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PasskeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>
          }
          findFirst: {
            args: Prisma.PasskeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PasskeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>
          }
          findMany: {
            args: Prisma.PasskeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>[]
          }
          create: {
            args: Prisma.PasskeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>
          }
          createMany: {
            args: Prisma.PasskeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PasskeyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>[]
          }
          delete: {
            args: Prisma.PasskeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>
          }
          update: {
            args: Prisma.PasskeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>
          }
          deleteMany: {
            args: Prisma.PasskeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PasskeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PasskeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasskeyPayload>
          }
          aggregate: {
            args: Prisma.PasskeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePasskey>
          }
          groupBy: {
            args: Prisma.PasskeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<PasskeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.PasskeyCountArgs<ExtArgs>
            result: $Utils.Optional<PasskeyCountAggregateOutputType> | number
          }
        }
      }
      Totp: {
        payload: Prisma.$TotpPayload<ExtArgs>
        fields: Prisma.TotpFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TotpFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TotpFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>
          }
          findFirst: {
            args: Prisma.TotpFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TotpFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>
          }
          findMany: {
            args: Prisma.TotpFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>[]
          }
          create: {
            args: Prisma.TotpCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>
          }
          createMany: {
            args: Prisma.TotpCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TotpCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>[]
          }
          delete: {
            args: Prisma.TotpDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>
          }
          update: {
            args: Prisma.TotpUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>
          }
          deleteMany: {
            args: Prisma.TotpDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TotpUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TotpUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TotpPayload>
          }
          aggregate: {
            args: Prisma.TotpAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTotp>
          }
          groupBy: {
            args: Prisma.TotpGroupByArgs<ExtArgs>
            result: $Utils.Optional<TotpGroupByOutputType>[]
          }
          count: {
            args: Prisma.TotpCountArgs<ExtArgs>
            result: $Utils.Optional<TotpCountAggregateOutputType> | number
          }
        }
      }
      Course: {
        payload: Prisma.$CoursePayload<ExtArgs>
        fields: Prisma.CourseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findFirst: {
            args: Prisma.CourseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findMany: {
            args: Prisma.CourseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          create: {
            args: Prisma.CourseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          createMany: {
            args: Prisma.CourseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          delete: {
            args: Prisma.CourseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          update: {
            args: Prisma.CourseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          deleteMany: {
            args: Prisma.CourseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CourseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          aggregate: {
            args: Prisma.CourseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourse>
          }
          groupBy: {
            args: Prisma.CourseGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseCountArgs<ExtArgs>
            result: $Utils.Optional<CourseCountAggregateOutputType> | number
          }
        }
      }
      Lesson: {
        payload: Prisma.$LessonPayload<ExtArgs>
        fields: Prisma.LessonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LessonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LessonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>
          }
          findFirst: {
            args: Prisma.LessonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LessonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>
          }
          findMany: {
            args: Prisma.LessonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>[]
          }
          create: {
            args: Prisma.LessonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>
          }
          createMany: {
            args: Prisma.LessonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LessonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>[]
          }
          delete: {
            args: Prisma.LessonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>
          }
          update: {
            args: Prisma.LessonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>
          }
          deleteMany: {
            args: Prisma.LessonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LessonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LessonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LessonPayload>
          }
          aggregate: {
            args: Prisma.LessonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLesson>
          }
          groupBy: {
            args: Prisma.LessonGroupByArgs<ExtArgs>
            result: $Utils.Optional<LessonGroupByOutputType>[]
          }
          count: {
            args: Prisma.LessonCountArgs<ExtArgs>
            result: $Utils.Optional<LessonCountAggregateOutputType> | number
          }
        }
      }
      UserProgress: {
        payload: Prisma.$UserProgressPayload<ExtArgs>
        fields: Prisma.UserProgressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProgressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProgressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          findFirst: {
            args: Prisma.UserProgressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProgressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          findMany: {
            args: Prisma.UserProgressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>[]
          }
          create: {
            args: Prisma.UserProgressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          createMany: {
            args: Prisma.UserProgressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProgressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>[]
          }
          delete: {
            args: Prisma.UserProgressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          update: {
            args: Prisma.UserProgressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          deleteMany: {
            args: Prisma.UserProgressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProgressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserProgressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProgressPayload>
          }
          aggregate: {
            args: Prisma.UserProgressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProgress>
          }
          groupBy: {
            args: Prisma.UserProgressGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProgressGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProgressCountArgs<ExtArgs>
            result: $Utils.Optional<UserProgressCountAggregateOutputType> | number
          }
        }
      }
      DeletionInfo: {
        payload: Prisma.$DeletionInfoPayload<ExtArgs>
        fields: Prisma.DeletionInfoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeletionInfoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeletionInfoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>
          }
          findFirst: {
            args: Prisma.DeletionInfoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeletionInfoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>
          }
          findMany: {
            args: Prisma.DeletionInfoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>[]
          }
          create: {
            args: Prisma.DeletionInfoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>
          }
          createMany: {
            args: Prisma.DeletionInfoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeletionInfoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>[]
          }
          delete: {
            args: Prisma.DeletionInfoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>
          }
          update: {
            args: Prisma.DeletionInfoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>
          }
          deleteMany: {
            args: Prisma.DeletionInfoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeletionInfoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DeletionInfoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeletionInfoPayload>
          }
          aggregate: {
            args: Prisma.DeletionInfoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeletionInfo>
          }
          groupBy: {
            args: Prisma.DeletionInfoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeletionInfoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeletionInfoCountArgs<ExtArgs>
            result: $Utils.Optional<DeletionInfoCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    userProgress: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userProgress?: boolean | UserCountOutputTypeCountUserProgressArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProgressWhereInput
  }


  /**
   * Count Type CourseCountOutputType
   */

  export type CourseCountOutputType = {
    lessons: number
  }

  export type CourseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lessons?: boolean | CourseCountOutputTypeCountLessonsArgs
  }

  // Custom InputTypes
  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseCountOutputType
     */
    select?: CourseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeCountLessonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LessonWhereInput
  }


  /**
   * Count Type LessonCountOutputType
   */

  export type LessonCountOutputType = {
    userProgress: number
  }

  export type LessonCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userProgress?: boolean | LessonCountOutputTypeCountUserProgressArgs
  }

  // Custom InputTypes
  /**
   * LessonCountOutputType without action
   */
  export type LessonCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LessonCountOutputType
     */
    select?: LessonCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LessonCountOutputType without action
   */
  export type LessonCountOutputTypeCountUserProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProgressWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    points: number | null
  }

  export type UserSumAggregateOutputType = {
    points: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    username: string | null
    displayName: string | null
    avatar: string | null
    points: number | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    username: string | null
    displayName: string | null
    avatar: string | null
    points: number | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    username: number
    displayName: number
    avatar: number
    points: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    points?: true
  }

  export type UserSumAggregateInputType = {
    points?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    username?: true
    displayName?: true
    avatar?: true
    points?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    username?: true
    displayName?: true
    avatar?: true
    points?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    username?: true
    displayName?: true
    avatar?: true
    points?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    password: string | null
    username: string
    displayName: string
    avatar: string | null
    points: number
    role: $Enums.UserRole
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    displayName?: boolean
    avatar?: boolean
    points?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userProgress?: boolean | User$userProgressArgs<ExtArgs>
    passwordReset?: boolean | User$passwordResetArgs<ExtArgs>
    mfa?: boolean | User$mfaArgs<ExtArgs>
    deletionInfo?: boolean | User$deletionInfoArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    displayName?: boolean
    avatar?: boolean
    points?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    username?: boolean
    displayName?: boolean
    avatar?: boolean
    points?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userProgress?: boolean | User$userProgressArgs<ExtArgs>
    passwordReset?: boolean | User$passwordResetArgs<ExtArgs>
    mfa?: boolean | User$mfaArgs<ExtArgs>
    deletionInfo?: boolean | User$deletionInfoArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      userProgress: Prisma.$UserProgressPayload<ExtArgs>[]
      passwordReset: Prisma.$PasswordResetPayload<ExtArgs> | null
      mfa: Prisma.$MultiFactorAuthenticationPayload<ExtArgs> | null
      deletionInfo: Prisma.$DeletionInfoPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string | null
      username: string
      displayName: string
      avatar: string | null
      points: number
      role: $Enums.UserRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userProgress<T extends User$userProgressArgs<ExtArgs> = {}>(args?: Subset<T, User$userProgressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findMany"> | Null>
    passwordReset<T extends User$passwordResetArgs<ExtArgs> = {}>(args?: Subset<T, User$passwordResetArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    mfa<T extends User$mfaArgs<ExtArgs> = {}>(args?: Subset<T, User$mfaArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    deletionInfo<T extends User$deletionInfoArgs<ExtArgs> = {}>(args?: Subset<T, User$deletionInfoArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly displayName: FieldRef<"User", 'String'>
    readonly avatar: FieldRef<"User", 'String'>
    readonly points: FieldRef<"User", 'Int'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.userProgress
   */
  export type User$userProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    where?: UserProgressWhereInput
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    cursor?: UserProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * User.passwordReset
   */
  export type User$passwordResetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    where?: PasswordResetWhereInput
  }

  /**
   * User.mfa
   */
  export type User$mfaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    where?: MultiFactorAuthenticationWhereInput
  }

  /**
   * User.deletionInfo
   */
  export type User$deletionInfoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    where?: DeletionInfoWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model PasswordReset
   */

  export type AggregatePasswordReset = {
    _count: PasswordResetCountAggregateOutputType | null
    _min: PasswordResetMinAggregateOutputType | null
    _max: PasswordResetMaxAggregateOutputType | null
  }

  export type PasswordResetMinAggregateOutputType = {
    id: string | null
    token: string | null
    expiry: Date | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PasswordResetMaxAggregateOutputType = {
    id: string | null
    token: string | null
    expiry: Date | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PasswordResetCountAggregateOutputType = {
    id: number
    token: number
    expiry: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PasswordResetMinAggregateInputType = {
    id?: true
    token?: true
    expiry?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PasswordResetMaxAggregateInputType = {
    id?: true
    token?: true
    expiry?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PasswordResetCountAggregateInputType = {
    id?: true
    token?: true
    expiry?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PasswordResetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordReset to aggregate.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PasswordResets
    **/
    _count?: true | PasswordResetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PasswordResetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PasswordResetMaxAggregateInputType
  }

  export type GetPasswordResetAggregateType<T extends PasswordResetAggregateArgs> = {
        [P in keyof T & keyof AggregatePasswordReset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePasswordReset[P]>
      : GetScalarType<T[P], AggregatePasswordReset[P]>
  }




  export type PasswordResetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetWhereInput
    orderBy?: PasswordResetOrderByWithAggregationInput | PasswordResetOrderByWithAggregationInput[]
    by: PasswordResetScalarFieldEnum[] | PasswordResetScalarFieldEnum
    having?: PasswordResetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PasswordResetCountAggregateInputType | true
    _min?: PasswordResetMinAggregateInputType
    _max?: PasswordResetMaxAggregateInputType
  }

  export type PasswordResetGroupByOutputType = {
    id: string
    token: string
    expiry: Date
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: PasswordResetCountAggregateOutputType | null
    _min: PasswordResetMinAggregateOutputType | null
    _max: PasswordResetMaxAggregateOutputType | null
  }

  type GetPasswordResetGroupByPayload<T extends PasswordResetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PasswordResetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PasswordResetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PasswordResetGroupByOutputType[P]>
            : GetScalarType<T[P], PasswordResetGroupByOutputType[P]>
        }
      >
    >


  export type PasswordResetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    expiry?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordReset"]>

  export type PasswordResetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    expiry?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordReset"]>

  export type PasswordResetSelectScalar = {
    id?: boolean
    token?: boolean
    expiry?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PasswordResetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PasswordResetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PasswordResetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PasswordReset"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      token: string
      expiry: Date
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["passwordReset"]>
    composites: {}
  }

  type PasswordResetGetPayload<S extends boolean | null | undefined | PasswordResetDefaultArgs> = $Result.GetResult<Prisma.$PasswordResetPayload, S>

  type PasswordResetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PasswordResetFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PasswordResetCountAggregateInputType | true
    }

  export interface PasswordResetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PasswordReset'], meta: { name: 'PasswordReset' } }
    /**
     * Find zero or one PasswordReset that matches the filter.
     * @param {PasswordResetFindUniqueArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PasswordResetFindUniqueArgs>(args: SelectSubset<T, PasswordResetFindUniqueArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PasswordReset that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PasswordResetFindUniqueOrThrowArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PasswordResetFindUniqueOrThrowArgs>(args: SelectSubset<T, PasswordResetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PasswordReset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetFindFirstArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PasswordResetFindFirstArgs>(args?: SelectSubset<T, PasswordResetFindFirstArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PasswordReset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetFindFirstOrThrowArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PasswordResetFindFirstOrThrowArgs>(args?: SelectSubset<T, PasswordResetFindFirstOrThrowArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PasswordResets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PasswordResets
     * const passwordResets = await prisma.passwordReset.findMany()
     * 
     * // Get first 10 PasswordResets
     * const passwordResets = await prisma.passwordReset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passwordResetWithIdOnly = await prisma.passwordReset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PasswordResetFindManyArgs>(args?: SelectSubset<T, PasswordResetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PasswordReset.
     * @param {PasswordResetCreateArgs} args - Arguments to create a PasswordReset.
     * @example
     * // Create one PasswordReset
     * const PasswordReset = await prisma.passwordReset.create({
     *   data: {
     *     // ... data to create a PasswordReset
     *   }
     * })
     * 
     */
    create<T extends PasswordResetCreateArgs>(args: SelectSubset<T, PasswordResetCreateArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PasswordResets.
     * @param {PasswordResetCreateManyArgs} args - Arguments to create many PasswordResets.
     * @example
     * // Create many PasswordResets
     * const passwordReset = await prisma.passwordReset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PasswordResetCreateManyArgs>(args?: SelectSubset<T, PasswordResetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PasswordResets and returns the data saved in the database.
     * @param {PasswordResetCreateManyAndReturnArgs} args - Arguments to create many PasswordResets.
     * @example
     * // Create many PasswordResets
     * const passwordReset = await prisma.passwordReset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PasswordResets and only return the `id`
     * const passwordResetWithIdOnly = await prisma.passwordReset.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PasswordResetCreateManyAndReturnArgs>(args?: SelectSubset<T, PasswordResetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PasswordReset.
     * @param {PasswordResetDeleteArgs} args - Arguments to delete one PasswordReset.
     * @example
     * // Delete one PasswordReset
     * const PasswordReset = await prisma.passwordReset.delete({
     *   where: {
     *     // ... filter to delete one PasswordReset
     *   }
     * })
     * 
     */
    delete<T extends PasswordResetDeleteArgs>(args: SelectSubset<T, PasswordResetDeleteArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PasswordReset.
     * @param {PasswordResetUpdateArgs} args - Arguments to update one PasswordReset.
     * @example
     * // Update one PasswordReset
     * const passwordReset = await prisma.passwordReset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PasswordResetUpdateArgs>(args: SelectSubset<T, PasswordResetUpdateArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PasswordResets.
     * @param {PasswordResetDeleteManyArgs} args - Arguments to filter PasswordResets to delete.
     * @example
     * // Delete a few PasswordResets
     * const { count } = await prisma.passwordReset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PasswordResetDeleteManyArgs>(args?: SelectSubset<T, PasswordResetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PasswordResets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PasswordResets
     * const passwordReset = await prisma.passwordReset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PasswordResetUpdateManyArgs>(args: SelectSubset<T, PasswordResetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PasswordReset.
     * @param {PasswordResetUpsertArgs} args - Arguments to update or create a PasswordReset.
     * @example
     * // Update or create a PasswordReset
     * const passwordReset = await prisma.passwordReset.upsert({
     *   create: {
     *     // ... data to create a PasswordReset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PasswordReset we want to update
     *   }
     * })
     */
    upsert<T extends PasswordResetUpsertArgs>(args: SelectSubset<T, PasswordResetUpsertArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PasswordResets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetCountArgs} args - Arguments to filter PasswordResets to count.
     * @example
     * // Count the number of PasswordResets
     * const count = await prisma.passwordReset.count({
     *   where: {
     *     // ... the filter for the PasswordResets we want to count
     *   }
     * })
    **/
    count<T extends PasswordResetCountArgs>(
      args?: Subset<T, PasswordResetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PasswordResetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PasswordReset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PasswordResetAggregateArgs>(args: Subset<T, PasswordResetAggregateArgs>): Prisma.PrismaPromise<GetPasswordResetAggregateType<T>>

    /**
     * Group by PasswordReset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PasswordResetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PasswordResetGroupByArgs['orderBy'] }
        : { orderBy?: PasswordResetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PasswordResetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPasswordResetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PasswordReset model
   */
  readonly fields: PasswordResetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PasswordReset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PasswordResetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PasswordReset model
   */ 
  interface PasswordResetFieldRefs {
    readonly id: FieldRef<"PasswordReset", 'String'>
    readonly token: FieldRef<"PasswordReset", 'String'>
    readonly expiry: FieldRef<"PasswordReset", 'DateTime'>
    readonly userId: FieldRef<"PasswordReset", 'String'>
    readonly createdAt: FieldRef<"PasswordReset", 'DateTime'>
    readonly updatedAt: FieldRef<"PasswordReset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PasswordReset findUnique
   */
  export type PasswordResetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset findUniqueOrThrow
   */
  export type PasswordResetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset findFirst
   */
  export type PasswordResetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResets.
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResets.
     */
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * PasswordReset findFirstOrThrow
   */
  export type PasswordResetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResets.
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResets.
     */
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * PasswordReset findMany
   */
  export type PasswordResetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResets to fetch.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PasswordResets.
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * PasswordReset create
   */
  export type PasswordResetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * The data needed to create a PasswordReset.
     */
    data: XOR<PasswordResetCreateInput, PasswordResetUncheckedCreateInput>
  }

  /**
   * PasswordReset createMany
   */
  export type PasswordResetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PasswordResets.
     */
    data: PasswordResetCreateManyInput | PasswordResetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PasswordReset createManyAndReturn
   */
  export type PasswordResetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PasswordResets.
     */
    data: PasswordResetCreateManyInput | PasswordResetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PasswordReset update
   */
  export type PasswordResetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * The data needed to update a PasswordReset.
     */
    data: XOR<PasswordResetUpdateInput, PasswordResetUncheckedUpdateInput>
    /**
     * Choose, which PasswordReset to update.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset updateMany
   */
  export type PasswordResetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PasswordResets.
     */
    data: XOR<PasswordResetUpdateManyMutationInput, PasswordResetUncheckedUpdateManyInput>
    /**
     * Filter which PasswordResets to update
     */
    where?: PasswordResetWhereInput
  }

  /**
   * PasswordReset upsert
   */
  export type PasswordResetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * The filter to search for the PasswordReset to update in case it exists.
     */
    where: PasswordResetWhereUniqueInput
    /**
     * In case the PasswordReset found by the `where` argument doesn't exist, create a new PasswordReset with this data.
     */
    create: XOR<PasswordResetCreateInput, PasswordResetUncheckedCreateInput>
    /**
     * In case the PasswordReset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PasswordResetUpdateInput, PasswordResetUncheckedUpdateInput>
  }

  /**
   * PasswordReset delete
   */
  export type PasswordResetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter which PasswordReset to delete.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset deleteMany
   */
  export type PasswordResetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordResets to delete
     */
    where?: PasswordResetWhereInput
  }

  /**
   * PasswordReset without action
   */
  export type PasswordResetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
  }


  /**
   * Model MultiFactorAuthentication
   */

  export type AggregateMultiFactorAuthentication = {
    _count: MultiFactorAuthenticationCountAggregateOutputType | null
    _min: MultiFactorAuthenticationMinAggregateOutputType | null
    _max: MultiFactorAuthenticationMaxAggregateOutputType | null
  }

  export type MultiFactorAuthenticationMinAggregateOutputType = {
    id: string | null
    totpId: string | null
    passkeyId: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MultiFactorAuthenticationMaxAggregateOutputType = {
    id: string | null
    totpId: string | null
    passkeyId: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MultiFactorAuthenticationCountAggregateOutputType = {
    id: number
    recoveryCodes: number
    totpId: number
    passkeyId: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MultiFactorAuthenticationMinAggregateInputType = {
    id?: true
    totpId?: true
    passkeyId?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MultiFactorAuthenticationMaxAggregateInputType = {
    id?: true
    totpId?: true
    passkeyId?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MultiFactorAuthenticationCountAggregateInputType = {
    id?: true
    recoveryCodes?: true
    totpId?: true
    passkeyId?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MultiFactorAuthenticationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MultiFactorAuthentication to aggregate.
     */
    where?: MultiFactorAuthenticationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MultiFactorAuthentications to fetch.
     */
    orderBy?: MultiFactorAuthenticationOrderByWithRelationInput | MultiFactorAuthenticationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MultiFactorAuthenticationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MultiFactorAuthentications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MultiFactorAuthentications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MultiFactorAuthentications
    **/
    _count?: true | MultiFactorAuthenticationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MultiFactorAuthenticationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MultiFactorAuthenticationMaxAggregateInputType
  }

  export type GetMultiFactorAuthenticationAggregateType<T extends MultiFactorAuthenticationAggregateArgs> = {
        [P in keyof T & keyof AggregateMultiFactorAuthentication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMultiFactorAuthentication[P]>
      : GetScalarType<T[P], AggregateMultiFactorAuthentication[P]>
  }




  export type MultiFactorAuthenticationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MultiFactorAuthenticationWhereInput
    orderBy?: MultiFactorAuthenticationOrderByWithAggregationInput | MultiFactorAuthenticationOrderByWithAggregationInput[]
    by: MultiFactorAuthenticationScalarFieldEnum[] | MultiFactorAuthenticationScalarFieldEnum
    having?: MultiFactorAuthenticationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MultiFactorAuthenticationCountAggregateInputType | true
    _min?: MultiFactorAuthenticationMinAggregateInputType
    _max?: MultiFactorAuthenticationMaxAggregateInputType
  }

  export type MultiFactorAuthenticationGroupByOutputType = {
    id: string
    recoveryCodes: string[]
    totpId: string | null
    passkeyId: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: MultiFactorAuthenticationCountAggregateOutputType | null
    _min: MultiFactorAuthenticationMinAggregateOutputType | null
    _max: MultiFactorAuthenticationMaxAggregateOutputType | null
  }

  type GetMultiFactorAuthenticationGroupByPayload<T extends MultiFactorAuthenticationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MultiFactorAuthenticationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MultiFactorAuthenticationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MultiFactorAuthenticationGroupByOutputType[P]>
            : GetScalarType<T[P], MultiFactorAuthenticationGroupByOutputType[P]>
        }
      >
    >


  export type MultiFactorAuthenticationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recoveryCodes?: boolean
    totpId?: boolean
    passkeyId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    totp?: boolean | MultiFactorAuthentication$totpArgs<ExtArgs>
    passkey?: boolean | MultiFactorAuthentication$passkeyArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["multiFactorAuthentication"]>

  export type MultiFactorAuthenticationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recoveryCodes?: boolean
    totpId?: boolean
    passkeyId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    totp?: boolean | MultiFactorAuthentication$totpArgs<ExtArgs>
    passkey?: boolean | MultiFactorAuthentication$passkeyArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["multiFactorAuthentication"]>

  export type MultiFactorAuthenticationSelectScalar = {
    id?: boolean
    recoveryCodes?: boolean
    totpId?: boolean
    passkeyId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MultiFactorAuthenticationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    totp?: boolean | MultiFactorAuthentication$totpArgs<ExtArgs>
    passkey?: boolean | MultiFactorAuthentication$passkeyArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MultiFactorAuthenticationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    totp?: boolean | MultiFactorAuthentication$totpArgs<ExtArgs>
    passkey?: boolean | MultiFactorAuthentication$passkeyArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MultiFactorAuthenticationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MultiFactorAuthentication"
    objects: {
      totp: Prisma.$TotpPayload<ExtArgs> | null
      passkey: Prisma.$PasskeyPayload<ExtArgs> | null
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      recoveryCodes: string[]
      totpId: string | null
      passkeyId: string | null
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["multiFactorAuthentication"]>
    composites: {}
  }

  type MultiFactorAuthenticationGetPayload<S extends boolean | null | undefined | MultiFactorAuthenticationDefaultArgs> = $Result.GetResult<Prisma.$MultiFactorAuthenticationPayload, S>

  type MultiFactorAuthenticationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MultiFactorAuthenticationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MultiFactorAuthenticationCountAggregateInputType | true
    }

  export interface MultiFactorAuthenticationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MultiFactorAuthentication'], meta: { name: 'MultiFactorAuthentication' } }
    /**
     * Find zero or one MultiFactorAuthentication that matches the filter.
     * @param {MultiFactorAuthenticationFindUniqueArgs} args - Arguments to find a MultiFactorAuthentication
     * @example
     * // Get one MultiFactorAuthentication
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MultiFactorAuthenticationFindUniqueArgs>(args: SelectSubset<T, MultiFactorAuthenticationFindUniqueArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MultiFactorAuthentication that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MultiFactorAuthenticationFindUniqueOrThrowArgs} args - Arguments to find a MultiFactorAuthentication
     * @example
     * // Get one MultiFactorAuthentication
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MultiFactorAuthenticationFindUniqueOrThrowArgs>(args: SelectSubset<T, MultiFactorAuthenticationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MultiFactorAuthentication that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationFindFirstArgs} args - Arguments to find a MultiFactorAuthentication
     * @example
     * // Get one MultiFactorAuthentication
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MultiFactorAuthenticationFindFirstArgs>(args?: SelectSubset<T, MultiFactorAuthenticationFindFirstArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MultiFactorAuthentication that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationFindFirstOrThrowArgs} args - Arguments to find a MultiFactorAuthentication
     * @example
     * // Get one MultiFactorAuthentication
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MultiFactorAuthenticationFindFirstOrThrowArgs>(args?: SelectSubset<T, MultiFactorAuthenticationFindFirstOrThrowArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MultiFactorAuthentications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MultiFactorAuthentications
     * const multiFactorAuthentications = await prisma.multiFactorAuthentication.findMany()
     * 
     * // Get first 10 MultiFactorAuthentications
     * const multiFactorAuthentications = await prisma.multiFactorAuthentication.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const multiFactorAuthenticationWithIdOnly = await prisma.multiFactorAuthentication.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MultiFactorAuthenticationFindManyArgs>(args?: SelectSubset<T, MultiFactorAuthenticationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MultiFactorAuthentication.
     * @param {MultiFactorAuthenticationCreateArgs} args - Arguments to create a MultiFactorAuthentication.
     * @example
     * // Create one MultiFactorAuthentication
     * const MultiFactorAuthentication = await prisma.multiFactorAuthentication.create({
     *   data: {
     *     // ... data to create a MultiFactorAuthentication
     *   }
     * })
     * 
     */
    create<T extends MultiFactorAuthenticationCreateArgs>(args: SelectSubset<T, MultiFactorAuthenticationCreateArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MultiFactorAuthentications.
     * @param {MultiFactorAuthenticationCreateManyArgs} args - Arguments to create many MultiFactorAuthentications.
     * @example
     * // Create many MultiFactorAuthentications
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MultiFactorAuthenticationCreateManyArgs>(args?: SelectSubset<T, MultiFactorAuthenticationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MultiFactorAuthentications and returns the data saved in the database.
     * @param {MultiFactorAuthenticationCreateManyAndReturnArgs} args - Arguments to create many MultiFactorAuthentications.
     * @example
     * // Create many MultiFactorAuthentications
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MultiFactorAuthentications and only return the `id`
     * const multiFactorAuthenticationWithIdOnly = await prisma.multiFactorAuthentication.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MultiFactorAuthenticationCreateManyAndReturnArgs>(args?: SelectSubset<T, MultiFactorAuthenticationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MultiFactorAuthentication.
     * @param {MultiFactorAuthenticationDeleteArgs} args - Arguments to delete one MultiFactorAuthentication.
     * @example
     * // Delete one MultiFactorAuthentication
     * const MultiFactorAuthentication = await prisma.multiFactorAuthentication.delete({
     *   where: {
     *     // ... filter to delete one MultiFactorAuthentication
     *   }
     * })
     * 
     */
    delete<T extends MultiFactorAuthenticationDeleteArgs>(args: SelectSubset<T, MultiFactorAuthenticationDeleteArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MultiFactorAuthentication.
     * @param {MultiFactorAuthenticationUpdateArgs} args - Arguments to update one MultiFactorAuthentication.
     * @example
     * // Update one MultiFactorAuthentication
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MultiFactorAuthenticationUpdateArgs>(args: SelectSubset<T, MultiFactorAuthenticationUpdateArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MultiFactorAuthentications.
     * @param {MultiFactorAuthenticationDeleteManyArgs} args - Arguments to filter MultiFactorAuthentications to delete.
     * @example
     * // Delete a few MultiFactorAuthentications
     * const { count } = await prisma.multiFactorAuthentication.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MultiFactorAuthenticationDeleteManyArgs>(args?: SelectSubset<T, MultiFactorAuthenticationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MultiFactorAuthentications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MultiFactorAuthentications
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MultiFactorAuthenticationUpdateManyArgs>(args: SelectSubset<T, MultiFactorAuthenticationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MultiFactorAuthentication.
     * @param {MultiFactorAuthenticationUpsertArgs} args - Arguments to update or create a MultiFactorAuthentication.
     * @example
     * // Update or create a MultiFactorAuthentication
     * const multiFactorAuthentication = await prisma.multiFactorAuthentication.upsert({
     *   create: {
     *     // ... data to create a MultiFactorAuthentication
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MultiFactorAuthentication we want to update
     *   }
     * })
     */
    upsert<T extends MultiFactorAuthenticationUpsertArgs>(args: SelectSubset<T, MultiFactorAuthenticationUpsertArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MultiFactorAuthentications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationCountArgs} args - Arguments to filter MultiFactorAuthentications to count.
     * @example
     * // Count the number of MultiFactorAuthentications
     * const count = await prisma.multiFactorAuthentication.count({
     *   where: {
     *     // ... the filter for the MultiFactorAuthentications we want to count
     *   }
     * })
    **/
    count<T extends MultiFactorAuthenticationCountArgs>(
      args?: Subset<T, MultiFactorAuthenticationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MultiFactorAuthenticationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MultiFactorAuthentication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MultiFactorAuthenticationAggregateArgs>(args: Subset<T, MultiFactorAuthenticationAggregateArgs>): Prisma.PrismaPromise<GetMultiFactorAuthenticationAggregateType<T>>

    /**
     * Group by MultiFactorAuthentication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MultiFactorAuthenticationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MultiFactorAuthenticationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MultiFactorAuthenticationGroupByArgs['orderBy'] }
        : { orderBy?: MultiFactorAuthenticationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MultiFactorAuthenticationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMultiFactorAuthenticationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MultiFactorAuthentication model
   */
  readonly fields: MultiFactorAuthenticationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MultiFactorAuthentication.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MultiFactorAuthenticationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    totp<T extends MultiFactorAuthentication$totpArgs<ExtArgs> = {}>(args?: Subset<T, MultiFactorAuthentication$totpArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    passkey<T extends MultiFactorAuthentication$passkeyArgs<ExtArgs> = {}>(args?: Subset<T, MultiFactorAuthentication$passkeyArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MultiFactorAuthentication model
   */ 
  interface MultiFactorAuthenticationFieldRefs {
    readonly id: FieldRef<"MultiFactorAuthentication", 'String'>
    readonly recoveryCodes: FieldRef<"MultiFactorAuthentication", 'String[]'>
    readonly totpId: FieldRef<"MultiFactorAuthentication", 'String'>
    readonly passkeyId: FieldRef<"MultiFactorAuthentication", 'String'>
    readonly userId: FieldRef<"MultiFactorAuthentication", 'String'>
    readonly createdAt: FieldRef<"MultiFactorAuthentication", 'DateTime'>
    readonly updatedAt: FieldRef<"MultiFactorAuthentication", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MultiFactorAuthentication findUnique
   */
  export type MultiFactorAuthenticationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * Filter, which MultiFactorAuthentication to fetch.
     */
    where: MultiFactorAuthenticationWhereUniqueInput
  }

  /**
   * MultiFactorAuthentication findUniqueOrThrow
   */
  export type MultiFactorAuthenticationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * Filter, which MultiFactorAuthentication to fetch.
     */
    where: MultiFactorAuthenticationWhereUniqueInput
  }

  /**
   * MultiFactorAuthentication findFirst
   */
  export type MultiFactorAuthenticationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * Filter, which MultiFactorAuthentication to fetch.
     */
    where?: MultiFactorAuthenticationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MultiFactorAuthentications to fetch.
     */
    orderBy?: MultiFactorAuthenticationOrderByWithRelationInput | MultiFactorAuthenticationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MultiFactorAuthentications.
     */
    cursor?: MultiFactorAuthenticationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MultiFactorAuthentications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MultiFactorAuthentications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MultiFactorAuthentications.
     */
    distinct?: MultiFactorAuthenticationScalarFieldEnum | MultiFactorAuthenticationScalarFieldEnum[]
  }

  /**
   * MultiFactorAuthentication findFirstOrThrow
   */
  export type MultiFactorAuthenticationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * Filter, which MultiFactorAuthentication to fetch.
     */
    where?: MultiFactorAuthenticationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MultiFactorAuthentications to fetch.
     */
    orderBy?: MultiFactorAuthenticationOrderByWithRelationInput | MultiFactorAuthenticationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MultiFactorAuthentications.
     */
    cursor?: MultiFactorAuthenticationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MultiFactorAuthentications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MultiFactorAuthentications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MultiFactorAuthentications.
     */
    distinct?: MultiFactorAuthenticationScalarFieldEnum | MultiFactorAuthenticationScalarFieldEnum[]
  }

  /**
   * MultiFactorAuthentication findMany
   */
  export type MultiFactorAuthenticationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * Filter, which MultiFactorAuthentications to fetch.
     */
    where?: MultiFactorAuthenticationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MultiFactorAuthentications to fetch.
     */
    orderBy?: MultiFactorAuthenticationOrderByWithRelationInput | MultiFactorAuthenticationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MultiFactorAuthentications.
     */
    cursor?: MultiFactorAuthenticationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MultiFactorAuthentications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MultiFactorAuthentications.
     */
    skip?: number
    distinct?: MultiFactorAuthenticationScalarFieldEnum | MultiFactorAuthenticationScalarFieldEnum[]
  }

  /**
   * MultiFactorAuthentication create
   */
  export type MultiFactorAuthenticationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * The data needed to create a MultiFactorAuthentication.
     */
    data: XOR<MultiFactorAuthenticationCreateInput, MultiFactorAuthenticationUncheckedCreateInput>
  }

  /**
   * MultiFactorAuthentication createMany
   */
  export type MultiFactorAuthenticationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MultiFactorAuthentications.
     */
    data: MultiFactorAuthenticationCreateManyInput | MultiFactorAuthenticationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MultiFactorAuthentication createManyAndReturn
   */
  export type MultiFactorAuthenticationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MultiFactorAuthentications.
     */
    data: MultiFactorAuthenticationCreateManyInput | MultiFactorAuthenticationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MultiFactorAuthentication update
   */
  export type MultiFactorAuthenticationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * The data needed to update a MultiFactorAuthentication.
     */
    data: XOR<MultiFactorAuthenticationUpdateInput, MultiFactorAuthenticationUncheckedUpdateInput>
    /**
     * Choose, which MultiFactorAuthentication to update.
     */
    where: MultiFactorAuthenticationWhereUniqueInput
  }

  /**
   * MultiFactorAuthentication updateMany
   */
  export type MultiFactorAuthenticationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MultiFactorAuthentications.
     */
    data: XOR<MultiFactorAuthenticationUpdateManyMutationInput, MultiFactorAuthenticationUncheckedUpdateManyInput>
    /**
     * Filter which MultiFactorAuthentications to update
     */
    where?: MultiFactorAuthenticationWhereInput
  }

  /**
   * MultiFactorAuthentication upsert
   */
  export type MultiFactorAuthenticationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * The filter to search for the MultiFactorAuthentication to update in case it exists.
     */
    where: MultiFactorAuthenticationWhereUniqueInput
    /**
     * In case the MultiFactorAuthentication found by the `where` argument doesn't exist, create a new MultiFactorAuthentication with this data.
     */
    create: XOR<MultiFactorAuthenticationCreateInput, MultiFactorAuthenticationUncheckedCreateInput>
    /**
     * In case the MultiFactorAuthentication was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MultiFactorAuthenticationUpdateInput, MultiFactorAuthenticationUncheckedUpdateInput>
  }

  /**
   * MultiFactorAuthentication delete
   */
  export type MultiFactorAuthenticationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    /**
     * Filter which MultiFactorAuthentication to delete.
     */
    where: MultiFactorAuthenticationWhereUniqueInput
  }

  /**
   * MultiFactorAuthentication deleteMany
   */
  export type MultiFactorAuthenticationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MultiFactorAuthentications to delete
     */
    where?: MultiFactorAuthenticationWhereInput
  }

  /**
   * MultiFactorAuthentication.totp
   */
  export type MultiFactorAuthentication$totpArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    where?: TotpWhereInput
  }

  /**
   * MultiFactorAuthentication.passkey
   */
  export type MultiFactorAuthentication$passkeyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    where?: PasskeyWhereInput
  }

  /**
   * MultiFactorAuthentication without action
   */
  export type MultiFactorAuthenticationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
  }


  /**
   * Model Passkey
   */

  export type AggregatePasskey = {
    _count: PasskeyCountAggregateOutputType | null
    _min: PasskeyMinAggregateOutputType | null
    _max: PasskeyMaxAggregateOutputType | null
  }

  export type PasskeyMinAggregateOutputType = {
    id: string | null
    publicKey: string | null
    privateKey: string | null
    isActivated: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PasskeyMaxAggregateOutputType = {
    id: string | null
    publicKey: string | null
    privateKey: string | null
    isActivated: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PasskeyCountAggregateOutputType = {
    id: number
    publicKey: number
    privateKey: number
    isActivated: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PasskeyMinAggregateInputType = {
    id?: true
    publicKey?: true
    privateKey?: true
    isActivated?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PasskeyMaxAggregateInputType = {
    id?: true
    publicKey?: true
    privateKey?: true
    isActivated?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PasskeyCountAggregateInputType = {
    id?: true
    publicKey?: true
    privateKey?: true
    isActivated?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PasskeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Passkey to aggregate.
     */
    where?: PasskeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passkeys to fetch.
     */
    orderBy?: PasskeyOrderByWithRelationInput | PasskeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PasskeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passkeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passkeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Passkeys
    **/
    _count?: true | PasskeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PasskeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PasskeyMaxAggregateInputType
  }

  export type GetPasskeyAggregateType<T extends PasskeyAggregateArgs> = {
        [P in keyof T & keyof AggregatePasskey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePasskey[P]>
      : GetScalarType<T[P], AggregatePasskey[P]>
  }




  export type PasskeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasskeyWhereInput
    orderBy?: PasskeyOrderByWithAggregationInput | PasskeyOrderByWithAggregationInput[]
    by: PasskeyScalarFieldEnum[] | PasskeyScalarFieldEnum
    having?: PasskeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PasskeyCountAggregateInputType | true
    _min?: PasskeyMinAggregateInputType
    _max?: PasskeyMaxAggregateInputType
  }

  export type PasskeyGroupByOutputType = {
    id: string
    publicKey: string
    privateKey: string
    isActivated: boolean
    createdAt: Date
    updatedAt: Date
    _count: PasskeyCountAggregateOutputType | null
    _min: PasskeyMinAggregateOutputType | null
    _max: PasskeyMaxAggregateOutputType | null
  }

  type GetPasskeyGroupByPayload<T extends PasskeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PasskeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PasskeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PasskeyGroupByOutputType[P]>
            : GetScalarType<T[P], PasskeyGroupByOutputType[P]>
        }
      >
    >


  export type PasskeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    publicKey?: boolean
    privateKey?: boolean
    isActivated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mfa?: boolean | Passkey$mfaArgs<ExtArgs>
  }, ExtArgs["result"]["passkey"]>

  export type PasskeySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    publicKey?: boolean
    privateKey?: boolean
    isActivated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["passkey"]>

  export type PasskeySelectScalar = {
    id?: boolean
    publicKey?: boolean
    privateKey?: boolean
    isActivated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PasskeyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mfa?: boolean | Passkey$mfaArgs<ExtArgs>
  }
  export type PasskeyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PasskeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Passkey"
    objects: {
      mfa: Prisma.$MultiFactorAuthenticationPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      publicKey: string
      privateKey: string
      isActivated: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["passkey"]>
    composites: {}
  }

  type PasskeyGetPayload<S extends boolean | null | undefined | PasskeyDefaultArgs> = $Result.GetResult<Prisma.$PasskeyPayload, S>

  type PasskeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PasskeyFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PasskeyCountAggregateInputType | true
    }

  export interface PasskeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Passkey'], meta: { name: 'Passkey' } }
    /**
     * Find zero or one Passkey that matches the filter.
     * @param {PasskeyFindUniqueArgs} args - Arguments to find a Passkey
     * @example
     * // Get one Passkey
     * const passkey = await prisma.passkey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PasskeyFindUniqueArgs>(args: SelectSubset<T, PasskeyFindUniqueArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Passkey that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PasskeyFindUniqueOrThrowArgs} args - Arguments to find a Passkey
     * @example
     * // Get one Passkey
     * const passkey = await prisma.passkey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PasskeyFindUniqueOrThrowArgs>(args: SelectSubset<T, PasskeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Passkey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyFindFirstArgs} args - Arguments to find a Passkey
     * @example
     * // Get one Passkey
     * const passkey = await prisma.passkey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PasskeyFindFirstArgs>(args?: SelectSubset<T, PasskeyFindFirstArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Passkey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyFindFirstOrThrowArgs} args - Arguments to find a Passkey
     * @example
     * // Get one Passkey
     * const passkey = await prisma.passkey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PasskeyFindFirstOrThrowArgs>(args?: SelectSubset<T, PasskeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Passkeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Passkeys
     * const passkeys = await prisma.passkey.findMany()
     * 
     * // Get first 10 Passkeys
     * const passkeys = await prisma.passkey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passkeyWithIdOnly = await prisma.passkey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PasskeyFindManyArgs>(args?: SelectSubset<T, PasskeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Passkey.
     * @param {PasskeyCreateArgs} args - Arguments to create a Passkey.
     * @example
     * // Create one Passkey
     * const Passkey = await prisma.passkey.create({
     *   data: {
     *     // ... data to create a Passkey
     *   }
     * })
     * 
     */
    create<T extends PasskeyCreateArgs>(args: SelectSubset<T, PasskeyCreateArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Passkeys.
     * @param {PasskeyCreateManyArgs} args - Arguments to create many Passkeys.
     * @example
     * // Create many Passkeys
     * const passkey = await prisma.passkey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PasskeyCreateManyArgs>(args?: SelectSubset<T, PasskeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Passkeys and returns the data saved in the database.
     * @param {PasskeyCreateManyAndReturnArgs} args - Arguments to create many Passkeys.
     * @example
     * // Create many Passkeys
     * const passkey = await prisma.passkey.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Passkeys and only return the `id`
     * const passkeyWithIdOnly = await prisma.passkey.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PasskeyCreateManyAndReturnArgs>(args?: SelectSubset<T, PasskeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Passkey.
     * @param {PasskeyDeleteArgs} args - Arguments to delete one Passkey.
     * @example
     * // Delete one Passkey
     * const Passkey = await prisma.passkey.delete({
     *   where: {
     *     // ... filter to delete one Passkey
     *   }
     * })
     * 
     */
    delete<T extends PasskeyDeleteArgs>(args: SelectSubset<T, PasskeyDeleteArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Passkey.
     * @param {PasskeyUpdateArgs} args - Arguments to update one Passkey.
     * @example
     * // Update one Passkey
     * const passkey = await prisma.passkey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PasskeyUpdateArgs>(args: SelectSubset<T, PasskeyUpdateArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Passkeys.
     * @param {PasskeyDeleteManyArgs} args - Arguments to filter Passkeys to delete.
     * @example
     * // Delete a few Passkeys
     * const { count } = await prisma.passkey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PasskeyDeleteManyArgs>(args?: SelectSubset<T, PasskeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Passkeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Passkeys
     * const passkey = await prisma.passkey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PasskeyUpdateManyArgs>(args: SelectSubset<T, PasskeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Passkey.
     * @param {PasskeyUpsertArgs} args - Arguments to update or create a Passkey.
     * @example
     * // Update or create a Passkey
     * const passkey = await prisma.passkey.upsert({
     *   create: {
     *     // ... data to create a Passkey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Passkey we want to update
     *   }
     * })
     */
    upsert<T extends PasskeyUpsertArgs>(args: SelectSubset<T, PasskeyUpsertArgs<ExtArgs>>): Prisma__PasskeyClient<$Result.GetResult<Prisma.$PasskeyPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Passkeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyCountArgs} args - Arguments to filter Passkeys to count.
     * @example
     * // Count the number of Passkeys
     * const count = await prisma.passkey.count({
     *   where: {
     *     // ... the filter for the Passkeys we want to count
     *   }
     * })
    **/
    count<T extends PasskeyCountArgs>(
      args?: Subset<T, PasskeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PasskeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Passkey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PasskeyAggregateArgs>(args: Subset<T, PasskeyAggregateArgs>): Prisma.PrismaPromise<GetPasskeyAggregateType<T>>

    /**
     * Group by Passkey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasskeyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PasskeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PasskeyGroupByArgs['orderBy'] }
        : { orderBy?: PasskeyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PasskeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPasskeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Passkey model
   */
  readonly fields: PasskeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Passkey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PasskeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    mfa<T extends Passkey$mfaArgs<ExtArgs> = {}>(args?: Subset<T, Passkey$mfaArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Passkey model
   */ 
  interface PasskeyFieldRefs {
    readonly id: FieldRef<"Passkey", 'String'>
    readonly publicKey: FieldRef<"Passkey", 'String'>
    readonly privateKey: FieldRef<"Passkey", 'String'>
    readonly isActivated: FieldRef<"Passkey", 'Boolean'>
    readonly createdAt: FieldRef<"Passkey", 'DateTime'>
    readonly updatedAt: FieldRef<"Passkey", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Passkey findUnique
   */
  export type PasskeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * Filter, which Passkey to fetch.
     */
    where: PasskeyWhereUniqueInput
  }

  /**
   * Passkey findUniqueOrThrow
   */
  export type PasskeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * Filter, which Passkey to fetch.
     */
    where: PasskeyWhereUniqueInput
  }

  /**
   * Passkey findFirst
   */
  export type PasskeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * Filter, which Passkey to fetch.
     */
    where?: PasskeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passkeys to fetch.
     */
    orderBy?: PasskeyOrderByWithRelationInput | PasskeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Passkeys.
     */
    cursor?: PasskeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passkeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passkeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Passkeys.
     */
    distinct?: PasskeyScalarFieldEnum | PasskeyScalarFieldEnum[]
  }

  /**
   * Passkey findFirstOrThrow
   */
  export type PasskeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * Filter, which Passkey to fetch.
     */
    where?: PasskeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passkeys to fetch.
     */
    orderBy?: PasskeyOrderByWithRelationInput | PasskeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Passkeys.
     */
    cursor?: PasskeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passkeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passkeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Passkeys.
     */
    distinct?: PasskeyScalarFieldEnum | PasskeyScalarFieldEnum[]
  }

  /**
   * Passkey findMany
   */
  export type PasskeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * Filter, which Passkeys to fetch.
     */
    where?: PasskeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passkeys to fetch.
     */
    orderBy?: PasskeyOrderByWithRelationInput | PasskeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Passkeys.
     */
    cursor?: PasskeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passkeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passkeys.
     */
    skip?: number
    distinct?: PasskeyScalarFieldEnum | PasskeyScalarFieldEnum[]
  }

  /**
   * Passkey create
   */
  export type PasskeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * The data needed to create a Passkey.
     */
    data: XOR<PasskeyCreateInput, PasskeyUncheckedCreateInput>
  }

  /**
   * Passkey createMany
   */
  export type PasskeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Passkeys.
     */
    data: PasskeyCreateManyInput | PasskeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Passkey createManyAndReturn
   */
  export type PasskeyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Passkeys.
     */
    data: PasskeyCreateManyInput | PasskeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Passkey update
   */
  export type PasskeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * The data needed to update a Passkey.
     */
    data: XOR<PasskeyUpdateInput, PasskeyUncheckedUpdateInput>
    /**
     * Choose, which Passkey to update.
     */
    where: PasskeyWhereUniqueInput
  }

  /**
   * Passkey updateMany
   */
  export type PasskeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Passkeys.
     */
    data: XOR<PasskeyUpdateManyMutationInput, PasskeyUncheckedUpdateManyInput>
    /**
     * Filter which Passkeys to update
     */
    where?: PasskeyWhereInput
  }

  /**
   * Passkey upsert
   */
  export type PasskeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * The filter to search for the Passkey to update in case it exists.
     */
    where: PasskeyWhereUniqueInput
    /**
     * In case the Passkey found by the `where` argument doesn't exist, create a new Passkey with this data.
     */
    create: XOR<PasskeyCreateInput, PasskeyUncheckedCreateInput>
    /**
     * In case the Passkey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PasskeyUpdateInput, PasskeyUncheckedUpdateInput>
  }

  /**
   * Passkey delete
   */
  export type PasskeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
    /**
     * Filter which Passkey to delete.
     */
    where: PasskeyWhereUniqueInput
  }

  /**
   * Passkey deleteMany
   */
  export type PasskeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Passkeys to delete
     */
    where?: PasskeyWhereInput
  }

  /**
   * Passkey.mfa
   */
  export type Passkey$mfaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    where?: MultiFactorAuthenticationWhereInput
  }

  /**
   * Passkey without action
   */
  export type PasskeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passkey
     */
    select?: PasskeySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasskeyInclude<ExtArgs> | null
  }


  /**
   * Model Totp
   */

  export type AggregateTotp = {
    _count: TotpCountAggregateOutputType | null
    _min: TotpMinAggregateOutputType | null
    _max: TotpMaxAggregateOutputType | null
  }

  export type TotpMinAggregateOutputType = {
    id: string | null
    status: $Enums.TotpStatus | null
    secret: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TotpMaxAggregateOutputType = {
    id: string | null
    status: $Enums.TotpStatus | null
    secret: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TotpCountAggregateOutputType = {
    id: number
    status: number
    secret: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TotpMinAggregateInputType = {
    id?: true
    status?: true
    secret?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TotpMaxAggregateInputType = {
    id?: true
    status?: true
    secret?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TotpCountAggregateInputType = {
    id?: true
    status?: true
    secret?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TotpAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Totp to aggregate.
     */
    where?: TotpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Totps to fetch.
     */
    orderBy?: TotpOrderByWithRelationInput | TotpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TotpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Totps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Totps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Totps
    **/
    _count?: true | TotpCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TotpMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TotpMaxAggregateInputType
  }

  export type GetTotpAggregateType<T extends TotpAggregateArgs> = {
        [P in keyof T & keyof AggregateTotp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTotp[P]>
      : GetScalarType<T[P], AggregateTotp[P]>
  }




  export type TotpGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TotpWhereInput
    orderBy?: TotpOrderByWithAggregationInput | TotpOrderByWithAggregationInput[]
    by: TotpScalarFieldEnum[] | TotpScalarFieldEnum
    having?: TotpScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TotpCountAggregateInputType | true
    _min?: TotpMinAggregateInputType
    _max?: TotpMaxAggregateInputType
  }

  export type TotpGroupByOutputType = {
    id: string
    status: $Enums.TotpStatus
    secret: string | null
    createdAt: Date
    updatedAt: Date
    _count: TotpCountAggregateOutputType | null
    _min: TotpMinAggregateOutputType | null
    _max: TotpMaxAggregateOutputType | null
  }

  type GetTotpGroupByPayload<T extends TotpGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TotpGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TotpGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TotpGroupByOutputType[P]>
            : GetScalarType<T[P], TotpGroupByOutputType[P]>
        }
      >
    >


  export type TotpSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    secret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mfa?: boolean | Totp$mfaArgs<ExtArgs>
  }, ExtArgs["result"]["totp"]>

  export type TotpSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    secret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["totp"]>

  export type TotpSelectScalar = {
    id?: boolean
    status?: boolean
    secret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TotpInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mfa?: boolean | Totp$mfaArgs<ExtArgs>
  }
  export type TotpIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TotpPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Totp"
    objects: {
      mfa: Prisma.$MultiFactorAuthenticationPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      status: $Enums.TotpStatus
      secret: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["totp"]>
    composites: {}
  }

  type TotpGetPayload<S extends boolean | null | undefined | TotpDefaultArgs> = $Result.GetResult<Prisma.$TotpPayload, S>

  type TotpCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TotpFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TotpCountAggregateInputType | true
    }

  export interface TotpDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Totp'], meta: { name: 'Totp' } }
    /**
     * Find zero or one Totp that matches the filter.
     * @param {TotpFindUniqueArgs} args - Arguments to find a Totp
     * @example
     * // Get one Totp
     * const totp = await prisma.totp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TotpFindUniqueArgs>(args: SelectSubset<T, TotpFindUniqueArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Totp that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TotpFindUniqueOrThrowArgs} args - Arguments to find a Totp
     * @example
     * // Get one Totp
     * const totp = await prisma.totp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TotpFindUniqueOrThrowArgs>(args: SelectSubset<T, TotpFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Totp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpFindFirstArgs} args - Arguments to find a Totp
     * @example
     * // Get one Totp
     * const totp = await prisma.totp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TotpFindFirstArgs>(args?: SelectSubset<T, TotpFindFirstArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Totp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpFindFirstOrThrowArgs} args - Arguments to find a Totp
     * @example
     * // Get one Totp
     * const totp = await prisma.totp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TotpFindFirstOrThrowArgs>(args?: SelectSubset<T, TotpFindFirstOrThrowArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Totps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Totps
     * const totps = await prisma.totp.findMany()
     * 
     * // Get first 10 Totps
     * const totps = await prisma.totp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const totpWithIdOnly = await prisma.totp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TotpFindManyArgs>(args?: SelectSubset<T, TotpFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Totp.
     * @param {TotpCreateArgs} args - Arguments to create a Totp.
     * @example
     * // Create one Totp
     * const Totp = await prisma.totp.create({
     *   data: {
     *     // ... data to create a Totp
     *   }
     * })
     * 
     */
    create<T extends TotpCreateArgs>(args: SelectSubset<T, TotpCreateArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Totps.
     * @param {TotpCreateManyArgs} args - Arguments to create many Totps.
     * @example
     * // Create many Totps
     * const totp = await prisma.totp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TotpCreateManyArgs>(args?: SelectSubset<T, TotpCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Totps and returns the data saved in the database.
     * @param {TotpCreateManyAndReturnArgs} args - Arguments to create many Totps.
     * @example
     * // Create many Totps
     * const totp = await prisma.totp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Totps and only return the `id`
     * const totpWithIdOnly = await prisma.totp.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TotpCreateManyAndReturnArgs>(args?: SelectSubset<T, TotpCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Totp.
     * @param {TotpDeleteArgs} args - Arguments to delete one Totp.
     * @example
     * // Delete one Totp
     * const Totp = await prisma.totp.delete({
     *   where: {
     *     // ... filter to delete one Totp
     *   }
     * })
     * 
     */
    delete<T extends TotpDeleteArgs>(args: SelectSubset<T, TotpDeleteArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Totp.
     * @param {TotpUpdateArgs} args - Arguments to update one Totp.
     * @example
     * // Update one Totp
     * const totp = await prisma.totp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TotpUpdateArgs>(args: SelectSubset<T, TotpUpdateArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Totps.
     * @param {TotpDeleteManyArgs} args - Arguments to filter Totps to delete.
     * @example
     * // Delete a few Totps
     * const { count } = await prisma.totp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TotpDeleteManyArgs>(args?: SelectSubset<T, TotpDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Totps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Totps
     * const totp = await prisma.totp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TotpUpdateManyArgs>(args: SelectSubset<T, TotpUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Totp.
     * @param {TotpUpsertArgs} args - Arguments to update or create a Totp.
     * @example
     * // Update or create a Totp
     * const totp = await prisma.totp.upsert({
     *   create: {
     *     // ... data to create a Totp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Totp we want to update
     *   }
     * })
     */
    upsert<T extends TotpUpsertArgs>(args: SelectSubset<T, TotpUpsertArgs<ExtArgs>>): Prisma__TotpClient<$Result.GetResult<Prisma.$TotpPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Totps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpCountArgs} args - Arguments to filter Totps to count.
     * @example
     * // Count the number of Totps
     * const count = await prisma.totp.count({
     *   where: {
     *     // ... the filter for the Totps we want to count
     *   }
     * })
    **/
    count<T extends TotpCountArgs>(
      args?: Subset<T, TotpCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TotpCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Totp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TotpAggregateArgs>(args: Subset<T, TotpAggregateArgs>): Prisma.PrismaPromise<GetTotpAggregateType<T>>

    /**
     * Group by Totp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TotpGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TotpGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TotpGroupByArgs['orderBy'] }
        : { orderBy?: TotpGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TotpGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTotpGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Totp model
   */
  readonly fields: TotpFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Totp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TotpClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    mfa<T extends Totp$mfaArgs<ExtArgs> = {}>(args?: Subset<T, Totp$mfaArgs<ExtArgs>>): Prisma__MultiFactorAuthenticationClient<$Result.GetResult<Prisma.$MultiFactorAuthenticationPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Totp model
   */ 
  interface TotpFieldRefs {
    readonly id: FieldRef<"Totp", 'String'>
    readonly status: FieldRef<"Totp", 'TotpStatus'>
    readonly secret: FieldRef<"Totp", 'String'>
    readonly createdAt: FieldRef<"Totp", 'DateTime'>
    readonly updatedAt: FieldRef<"Totp", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Totp findUnique
   */
  export type TotpFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * Filter, which Totp to fetch.
     */
    where: TotpWhereUniqueInput
  }

  /**
   * Totp findUniqueOrThrow
   */
  export type TotpFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * Filter, which Totp to fetch.
     */
    where: TotpWhereUniqueInput
  }

  /**
   * Totp findFirst
   */
  export type TotpFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * Filter, which Totp to fetch.
     */
    where?: TotpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Totps to fetch.
     */
    orderBy?: TotpOrderByWithRelationInput | TotpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Totps.
     */
    cursor?: TotpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Totps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Totps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Totps.
     */
    distinct?: TotpScalarFieldEnum | TotpScalarFieldEnum[]
  }

  /**
   * Totp findFirstOrThrow
   */
  export type TotpFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * Filter, which Totp to fetch.
     */
    where?: TotpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Totps to fetch.
     */
    orderBy?: TotpOrderByWithRelationInput | TotpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Totps.
     */
    cursor?: TotpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Totps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Totps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Totps.
     */
    distinct?: TotpScalarFieldEnum | TotpScalarFieldEnum[]
  }

  /**
   * Totp findMany
   */
  export type TotpFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * Filter, which Totps to fetch.
     */
    where?: TotpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Totps to fetch.
     */
    orderBy?: TotpOrderByWithRelationInput | TotpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Totps.
     */
    cursor?: TotpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Totps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Totps.
     */
    skip?: number
    distinct?: TotpScalarFieldEnum | TotpScalarFieldEnum[]
  }

  /**
   * Totp create
   */
  export type TotpCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * The data needed to create a Totp.
     */
    data: XOR<TotpCreateInput, TotpUncheckedCreateInput>
  }

  /**
   * Totp createMany
   */
  export type TotpCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Totps.
     */
    data: TotpCreateManyInput | TotpCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Totp createManyAndReturn
   */
  export type TotpCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Totps.
     */
    data: TotpCreateManyInput | TotpCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Totp update
   */
  export type TotpUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * The data needed to update a Totp.
     */
    data: XOR<TotpUpdateInput, TotpUncheckedUpdateInput>
    /**
     * Choose, which Totp to update.
     */
    where: TotpWhereUniqueInput
  }

  /**
   * Totp updateMany
   */
  export type TotpUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Totps.
     */
    data: XOR<TotpUpdateManyMutationInput, TotpUncheckedUpdateManyInput>
    /**
     * Filter which Totps to update
     */
    where?: TotpWhereInput
  }

  /**
   * Totp upsert
   */
  export type TotpUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * The filter to search for the Totp to update in case it exists.
     */
    where: TotpWhereUniqueInput
    /**
     * In case the Totp found by the `where` argument doesn't exist, create a new Totp with this data.
     */
    create: XOR<TotpCreateInput, TotpUncheckedCreateInput>
    /**
     * In case the Totp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TotpUpdateInput, TotpUncheckedUpdateInput>
  }

  /**
   * Totp delete
   */
  export type TotpDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
    /**
     * Filter which Totp to delete.
     */
    where: TotpWhereUniqueInput
  }

  /**
   * Totp deleteMany
   */
  export type TotpDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Totps to delete
     */
    where?: TotpWhereInput
  }

  /**
   * Totp.mfa
   */
  export type Totp$mfaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MultiFactorAuthentication
     */
    select?: MultiFactorAuthenticationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MultiFactorAuthenticationInclude<ExtArgs> | null
    where?: MultiFactorAuthenticationWhereInput
  }

  /**
   * Totp without action
   */
  export type TotpDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Totp
     */
    select?: TotpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TotpInclude<ExtArgs> | null
  }


  /**
   * Model Course
   */

  export type AggregateCourse = {
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  export type CourseAvgAggregateOutputType = {
    views: number | null
  }

  export type CourseSumAggregateOutputType = {
    views: number | null
  }

  export type CourseMinAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    description: string | null
    thumbnail: string | null
    youtubeUrl: string | null
    codeUrl: string | null
    isPublished: boolean | null
    views: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CourseMaxAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    description: string | null
    thumbnail: string | null
    youtubeUrl: string | null
    codeUrl: string | null
    isPublished: boolean | null
    views: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CourseCountAggregateOutputType = {
    id: number
    title: number
    slug: number
    description: number
    thumbnail: number
    youtubeUrl: number
    codeUrl: number
    isPublished: number
    views: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CourseAvgAggregateInputType = {
    views?: true
  }

  export type CourseSumAggregateInputType = {
    views?: true
  }

  export type CourseMinAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    description?: true
    thumbnail?: true
    youtubeUrl?: true
    codeUrl?: true
    isPublished?: true
    views?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CourseMaxAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    description?: true
    thumbnail?: true
    youtubeUrl?: true
    codeUrl?: true
    isPublished?: true
    views?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CourseCountAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    description?: true
    thumbnail?: true
    youtubeUrl?: true
    codeUrl?: true
    isPublished?: true
    views?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CourseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Course to aggregate.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Courses
    **/
    _count?: true | CourseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CourseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CourseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseMaxAggregateInputType
  }

  export type GetCourseAggregateType<T extends CourseAggregateArgs> = {
        [P in keyof T & keyof AggregateCourse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourse[P]>
      : GetScalarType<T[P], AggregateCourse[P]>
  }




  export type CourseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseWhereInput
    orderBy?: CourseOrderByWithAggregationInput | CourseOrderByWithAggregationInput[]
    by: CourseScalarFieldEnum[] | CourseScalarFieldEnum
    having?: CourseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseCountAggregateInputType | true
    _avg?: CourseAvgAggregateInputType
    _sum?: CourseSumAggregateInputType
    _min?: CourseMinAggregateInputType
    _max?: CourseMaxAggregateInputType
  }

  export type CourseGroupByOutputType = {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail: string | null
    youtubeUrl: string | null
    codeUrl: string | null
    isPublished: boolean
    views: number
    createdAt: Date
    updatedAt: Date
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  type GetCourseGroupByPayload<T extends CourseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseGroupByOutputType[P]>
            : GetScalarType<T[P], CourseGroupByOutputType[P]>
        }
      >
    >


  export type CourseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    thumbnail?: boolean
    youtubeUrl?: boolean
    codeUrl?: boolean
    isPublished?: boolean
    views?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lessons?: boolean | Course$lessonsArgs<ExtArgs>
    _count?: boolean | CourseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    thumbnail?: boolean
    youtubeUrl?: boolean
    codeUrl?: boolean
    isPublished?: boolean
    views?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["course"]>

  export type CourseSelectScalar = {
    id?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    thumbnail?: boolean
    youtubeUrl?: boolean
    codeUrl?: boolean
    isPublished?: boolean
    views?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CourseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lessons?: boolean | Course$lessonsArgs<ExtArgs>
    _count?: boolean | CourseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CourseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CoursePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Course"
    objects: {
      lessons: Prisma.$LessonPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      slug: string
      description: string | null
      thumbnail: string | null
      youtubeUrl: string | null
      codeUrl: string | null
      isPublished: boolean
      views: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["course"]>
    composites: {}
  }

  type CourseGetPayload<S extends boolean | null | undefined | CourseDefaultArgs> = $Result.GetResult<Prisma.$CoursePayload, S>

  type CourseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CourseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CourseCountAggregateInputType | true
    }

  export interface CourseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Course'], meta: { name: 'Course' } }
    /**
     * Find zero or one Course that matches the filter.
     * @param {CourseFindUniqueArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseFindUniqueArgs>(args: SelectSubset<T, CourseFindUniqueArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Course that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CourseFindUniqueOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Course that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseFindFirstArgs>(args?: SelectSubset<T, CourseFindFirstArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Course that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Courses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Courses
     * const courses = await prisma.course.findMany()
     * 
     * // Get first 10 Courses
     * const courses = await prisma.course.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseWithIdOnly = await prisma.course.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseFindManyArgs>(args?: SelectSubset<T, CourseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Course.
     * @param {CourseCreateArgs} args - Arguments to create a Course.
     * @example
     * // Create one Course
     * const Course = await prisma.course.create({
     *   data: {
     *     // ... data to create a Course
     *   }
     * })
     * 
     */
    create<T extends CourseCreateArgs>(args: SelectSubset<T, CourseCreateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Courses.
     * @param {CourseCreateManyArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseCreateManyArgs>(args?: SelectSubset<T, CourseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Courses and returns the data saved in the database.
     * @param {CourseCreateManyAndReturnArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Course.
     * @param {CourseDeleteArgs} args - Arguments to delete one Course.
     * @example
     * // Delete one Course
     * const Course = await prisma.course.delete({
     *   where: {
     *     // ... filter to delete one Course
     *   }
     * })
     * 
     */
    delete<T extends CourseDeleteArgs>(args: SelectSubset<T, CourseDeleteArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Course.
     * @param {CourseUpdateArgs} args - Arguments to update one Course.
     * @example
     * // Update one Course
     * const course = await prisma.course.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseUpdateArgs>(args: SelectSubset<T, CourseUpdateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Courses.
     * @param {CourseDeleteManyArgs} args - Arguments to filter Courses to delete.
     * @example
     * // Delete a few Courses
     * const { count } = await prisma.course.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseDeleteManyArgs>(args?: SelectSubset<T, CourseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseUpdateManyArgs>(args: SelectSubset<T, CourseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Course.
     * @param {CourseUpsertArgs} args - Arguments to update or create a Course.
     * @example
     * // Update or create a Course
     * const course = await prisma.course.upsert({
     *   create: {
     *     // ... data to create a Course
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Course we want to update
     *   }
     * })
     */
    upsert<T extends CourseUpsertArgs>(args: SelectSubset<T, CourseUpsertArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseCountArgs} args - Arguments to filter Courses to count.
     * @example
     * // Count the number of Courses
     * const count = await prisma.course.count({
     *   where: {
     *     // ... the filter for the Courses we want to count
     *   }
     * })
    **/
    count<T extends CourseCountArgs>(
      args?: Subset<T, CourseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseAggregateArgs>(args: Subset<T, CourseAggregateArgs>): Prisma.PrismaPromise<GetCourseAggregateType<T>>

    /**
     * Group by Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseGroupByArgs['orderBy'] }
        : { orderBy?: CourseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Course model
   */
  readonly fields: CourseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Course.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lessons<T extends Course$lessonsArgs<ExtArgs> = {}>(args?: Subset<T, Course$lessonsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Course model
   */ 
  interface CourseFieldRefs {
    readonly id: FieldRef<"Course", 'String'>
    readonly title: FieldRef<"Course", 'String'>
    readonly slug: FieldRef<"Course", 'String'>
    readonly description: FieldRef<"Course", 'String'>
    readonly thumbnail: FieldRef<"Course", 'String'>
    readonly youtubeUrl: FieldRef<"Course", 'String'>
    readonly codeUrl: FieldRef<"Course", 'String'>
    readonly isPublished: FieldRef<"Course", 'Boolean'>
    readonly views: FieldRef<"Course", 'Int'>
    readonly createdAt: FieldRef<"Course", 'DateTime'>
    readonly updatedAt: FieldRef<"Course", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Course findUnique
   */
  export type CourseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course findUniqueOrThrow
   */
  export type CourseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course findFirst
   */
  export type CourseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course findFirstOrThrow
   */
  export type CourseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course findMany
   */
  export type CourseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Courses to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course create
   */
  export type CourseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to create a Course.
     */
    data: XOR<CourseCreateInput, CourseUncheckedCreateInput>
  }

  /**
   * Course createMany
   */
  export type CourseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Course createManyAndReturn
   */
  export type CourseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Course update
   */
  export type CourseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to update a Course.
     */
    data: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
    /**
     * Choose, which Course to update.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course updateMany
   */
  export type CourseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
  }

  /**
   * Course upsert
   */
  export type CourseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The filter to search for the Course to update in case it exists.
     */
    where: CourseWhereUniqueInput
    /**
     * In case the Course found by the `where` argument doesn't exist, create a new Course with this data.
     */
    create: XOR<CourseCreateInput, CourseUncheckedCreateInput>
    /**
     * In case the Course was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
  }

  /**
   * Course delete
   */
  export type CourseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter which Course to delete.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course deleteMany
   */
  export type CourseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Courses to delete
     */
    where?: CourseWhereInput
  }

  /**
   * Course.lessons
   */
  export type Course$lessonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    where?: LessonWhereInput
    orderBy?: LessonOrderByWithRelationInput | LessonOrderByWithRelationInput[]
    cursor?: LessonWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LessonScalarFieldEnum | LessonScalarFieldEnum[]
  }

  /**
   * Course without action
   */
  export type CourseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
  }


  /**
   * Model Lesson
   */

  export type AggregateLesson = {
    _count: LessonCountAggregateOutputType | null
    _avg: LessonAvgAggregateOutputType | null
    _sum: LessonSumAggregateOutputType | null
    _min: LessonMinAggregateOutputType | null
    _max: LessonMaxAggregateOutputType | null
  }

  export type LessonAvgAggregateOutputType = {
    position: number | null
  }

  export type LessonSumAggregateOutputType = {
    position: number | null
  }

  export type LessonMinAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    description: string | null
    position: number | null
    kinescopeId: string | null
    isPublished: boolean | null
    courseId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LessonMaxAggregateOutputType = {
    id: string | null
    title: string | null
    slug: string | null
    description: string | null
    position: number | null
    kinescopeId: string | null
    isPublished: boolean | null
    courseId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LessonCountAggregateOutputType = {
    id: number
    title: number
    slug: number
    description: number
    position: number
    kinescopeId: number
    isPublished: number
    courseId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LessonAvgAggregateInputType = {
    position?: true
  }

  export type LessonSumAggregateInputType = {
    position?: true
  }

  export type LessonMinAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    description?: true
    position?: true
    kinescopeId?: true
    isPublished?: true
    courseId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LessonMaxAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    description?: true
    position?: true
    kinescopeId?: true
    isPublished?: true
    courseId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LessonCountAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    description?: true
    position?: true
    kinescopeId?: true
    isPublished?: true
    courseId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LessonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lesson to aggregate.
     */
    where?: LessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lessons to fetch.
     */
    orderBy?: LessonOrderByWithRelationInput | LessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Lessons
    **/
    _count?: true | LessonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LessonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LessonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LessonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LessonMaxAggregateInputType
  }

  export type GetLessonAggregateType<T extends LessonAggregateArgs> = {
        [P in keyof T & keyof AggregateLesson]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLesson[P]>
      : GetScalarType<T[P], AggregateLesson[P]>
  }




  export type LessonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LessonWhereInput
    orderBy?: LessonOrderByWithAggregationInput | LessonOrderByWithAggregationInput[]
    by: LessonScalarFieldEnum[] | LessonScalarFieldEnum
    having?: LessonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LessonCountAggregateInputType | true
    _avg?: LessonAvgAggregateInputType
    _sum?: LessonSumAggregateInputType
    _min?: LessonMinAggregateInputType
    _max?: LessonMaxAggregateInputType
  }

  export type LessonGroupByOutputType = {
    id: string
    title: string
    slug: string
    description: string | null
    position: number
    kinescopeId: string | null
    isPublished: boolean
    courseId: string
    createdAt: Date
    updatedAt: Date
    _count: LessonCountAggregateOutputType | null
    _avg: LessonAvgAggregateOutputType | null
    _sum: LessonSumAggregateOutputType | null
    _min: LessonMinAggregateOutputType | null
    _max: LessonMaxAggregateOutputType | null
  }

  type GetLessonGroupByPayload<T extends LessonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LessonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LessonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LessonGroupByOutputType[P]>
            : GetScalarType<T[P], LessonGroupByOutputType[P]>
        }
      >
    >


  export type LessonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    position?: boolean
    kinescopeId?: boolean
    isPublished?: boolean
    courseId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userProgress?: boolean | Lesson$userProgressArgs<ExtArgs>
    course?: boolean | CourseDefaultArgs<ExtArgs>
    _count?: boolean | LessonCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lesson"]>

  export type LessonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    position?: boolean
    kinescopeId?: boolean
    isPublished?: boolean
    courseId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lesson"]>

  export type LessonSelectScalar = {
    id?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    position?: boolean
    kinescopeId?: boolean
    isPublished?: boolean
    courseId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LessonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userProgress?: boolean | Lesson$userProgressArgs<ExtArgs>
    course?: boolean | CourseDefaultArgs<ExtArgs>
    _count?: boolean | LessonCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LessonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }

  export type $LessonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Lesson"
    objects: {
      userProgress: Prisma.$UserProgressPayload<ExtArgs>[]
      course: Prisma.$CoursePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      slug: string
      description: string | null
      position: number
      kinescopeId: string | null
      isPublished: boolean
      courseId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["lesson"]>
    composites: {}
  }

  type LessonGetPayload<S extends boolean | null | undefined | LessonDefaultArgs> = $Result.GetResult<Prisma.$LessonPayload, S>

  type LessonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LessonFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LessonCountAggregateInputType | true
    }

  export interface LessonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Lesson'], meta: { name: 'Lesson' } }
    /**
     * Find zero or one Lesson that matches the filter.
     * @param {LessonFindUniqueArgs} args - Arguments to find a Lesson
     * @example
     * // Get one Lesson
     * const lesson = await prisma.lesson.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LessonFindUniqueArgs>(args: SelectSubset<T, LessonFindUniqueArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Lesson that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LessonFindUniqueOrThrowArgs} args - Arguments to find a Lesson
     * @example
     * // Get one Lesson
     * const lesson = await prisma.lesson.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LessonFindUniqueOrThrowArgs>(args: SelectSubset<T, LessonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Lesson that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonFindFirstArgs} args - Arguments to find a Lesson
     * @example
     * // Get one Lesson
     * const lesson = await prisma.lesson.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LessonFindFirstArgs>(args?: SelectSubset<T, LessonFindFirstArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Lesson that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonFindFirstOrThrowArgs} args - Arguments to find a Lesson
     * @example
     * // Get one Lesson
     * const lesson = await prisma.lesson.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LessonFindFirstOrThrowArgs>(args?: SelectSubset<T, LessonFindFirstOrThrowArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Lessons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Lessons
     * const lessons = await prisma.lesson.findMany()
     * 
     * // Get first 10 Lessons
     * const lessons = await prisma.lesson.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lessonWithIdOnly = await prisma.lesson.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LessonFindManyArgs>(args?: SelectSubset<T, LessonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Lesson.
     * @param {LessonCreateArgs} args - Arguments to create a Lesson.
     * @example
     * // Create one Lesson
     * const Lesson = await prisma.lesson.create({
     *   data: {
     *     // ... data to create a Lesson
     *   }
     * })
     * 
     */
    create<T extends LessonCreateArgs>(args: SelectSubset<T, LessonCreateArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Lessons.
     * @param {LessonCreateManyArgs} args - Arguments to create many Lessons.
     * @example
     * // Create many Lessons
     * const lesson = await prisma.lesson.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LessonCreateManyArgs>(args?: SelectSubset<T, LessonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Lessons and returns the data saved in the database.
     * @param {LessonCreateManyAndReturnArgs} args - Arguments to create many Lessons.
     * @example
     * // Create many Lessons
     * const lesson = await prisma.lesson.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Lessons and only return the `id`
     * const lessonWithIdOnly = await prisma.lesson.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LessonCreateManyAndReturnArgs>(args?: SelectSubset<T, LessonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Lesson.
     * @param {LessonDeleteArgs} args - Arguments to delete one Lesson.
     * @example
     * // Delete one Lesson
     * const Lesson = await prisma.lesson.delete({
     *   where: {
     *     // ... filter to delete one Lesson
     *   }
     * })
     * 
     */
    delete<T extends LessonDeleteArgs>(args: SelectSubset<T, LessonDeleteArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Lesson.
     * @param {LessonUpdateArgs} args - Arguments to update one Lesson.
     * @example
     * // Update one Lesson
     * const lesson = await prisma.lesson.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LessonUpdateArgs>(args: SelectSubset<T, LessonUpdateArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Lessons.
     * @param {LessonDeleteManyArgs} args - Arguments to filter Lessons to delete.
     * @example
     * // Delete a few Lessons
     * const { count } = await prisma.lesson.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LessonDeleteManyArgs>(args?: SelectSubset<T, LessonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lessons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Lessons
     * const lesson = await prisma.lesson.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LessonUpdateManyArgs>(args: SelectSubset<T, LessonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Lesson.
     * @param {LessonUpsertArgs} args - Arguments to update or create a Lesson.
     * @example
     * // Update or create a Lesson
     * const lesson = await prisma.lesson.upsert({
     *   create: {
     *     // ... data to create a Lesson
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lesson we want to update
     *   }
     * })
     */
    upsert<T extends LessonUpsertArgs>(args: SelectSubset<T, LessonUpsertArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Lessons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonCountArgs} args - Arguments to filter Lessons to count.
     * @example
     * // Count the number of Lessons
     * const count = await prisma.lesson.count({
     *   where: {
     *     // ... the filter for the Lessons we want to count
     *   }
     * })
    **/
    count<T extends LessonCountArgs>(
      args?: Subset<T, LessonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LessonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lesson.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LessonAggregateArgs>(args: Subset<T, LessonAggregateArgs>): Prisma.PrismaPromise<GetLessonAggregateType<T>>

    /**
     * Group by Lesson.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LessonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LessonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LessonGroupByArgs['orderBy'] }
        : { orderBy?: LessonGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LessonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLessonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Lesson model
   */
  readonly fields: LessonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Lesson.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LessonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    userProgress<T extends Lesson$userProgressArgs<ExtArgs> = {}>(args?: Subset<T, Lesson$userProgressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findMany"> | Null>
    course<T extends CourseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CourseDefaultArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Lesson model
   */ 
  interface LessonFieldRefs {
    readonly id: FieldRef<"Lesson", 'String'>
    readonly title: FieldRef<"Lesson", 'String'>
    readonly slug: FieldRef<"Lesson", 'String'>
    readonly description: FieldRef<"Lesson", 'String'>
    readonly position: FieldRef<"Lesson", 'Int'>
    readonly kinescopeId: FieldRef<"Lesson", 'String'>
    readonly isPublished: FieldRef<"Lesson", 'Boolean'>
    readonly courseId: FieldRef<"Lesson", 'String'>
    readonly createdAt: FieldRef<"Lesson", 'DateTime'>
    readonly updatedAt: FieldRef<"Lesson", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Lesson findUnique
   */
  export type LessonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * Filter, which Lesson to fetch.
     */
    where: LessonWhereUniqueInput
  }

  /**
   * Lesson findUniqueOrThrow
   */
  export type LessonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * Filter, which Lesson to fetch.
     */
    where: LessonWhereUniqueInput
  }

  /**
   * Lesson findFirst
   */
  export type LessonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * Filter, which Lesson to fetch.
     */
    where?: LessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lessons to fetch.
     */
    orderBy?: LessonOrderByWithRelationInput | LessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lessons.
     */
    cursor?: LessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lessons.
     */
    distinct?: LessonScalarFieldEnum | LessonScalarFieldEnum[]
  }

  /**
   * Lesson findFirstOrThrow
   */
  export type LessonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * Filter, which Lesson to fetch.
     */
    where?: LessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lessons to fetch.
     */
    orderBy?: LessonOrderByWithRelationInput | LessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lessons.
     */
    cursor?: LessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lessons.
     */
    distinct?: LessonScalarFieldEnum | LessonScalarFieldEnum[]
  }

  /**
   * Lesson findMany
   */
  export type LessonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * Filter, which Lessons to fetch.
     */
    where?: LessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lessons to fetch.
     */
    orderBy?: LessonOrderByWithRelationInput | LessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Lessons.
     */
    cursor?: LessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lessons.
     */
    skip?: number
    distinct?: LessonScalarFieldEnum | LessonScalarFieldEnum[]
  }

  /**
   * Lesson create
   */
  export type LessonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * The data needed to create a Lesson.
     */
    data: XOR<LessonCreateInput, LessonUncheckedCreateInput>
  }

  /**
   * Lesson createMany
   */
  export type LessonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Lessons.
     */
    data: LessonCreateManyInput | LessonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Lesson createManyAndReturn
   */
  export type LessonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Lessons.
     */
    data: LessonCreateManyInput | LessonCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lesson update
   */
  export type LessonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * The data needed to update a Lesson.
     */
    data: XOR<LessonUpdateInput, LessonUncheckedUpdateInput>
    /**
     * Choose, which Lesson to update.
     */
    where: LessonWhereUniqueInput
  }

  /**
   * Lesson updateMany
   */
  export type LessonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Lessons.
     */
    data: XOR<LessonUpdateManyMutationInput, LessonUncheckedUpdateManyInput>
    /**
     * Filter which Lessons to update
     */
    where?: LessonWhereInput
  }

  /**
   * Lesson upsert
   */
  export type LessonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * The filter to search for the Lesson to update in case it exists.
     */
    where: LessonWhereUniqueInput
    /**
     * In case the Lesson found by the `where` argument doesn't exist, create a new Lesson with this data.
     */
    create: XOR<LessonCreateInput, LessonUncheckedCreateInput>
    /**
     * In case the Lesson was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LessonUpdateInput, LessonUncheckedUpdateInput>
  }

  /**
   * Lesson delete
   */
  export type LessonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
    /**
     * Filter which Lesson to delete.
     */
    where: LessonWhereUniqueInput
  }

  /**
   * Lesson deleteMany
   */
  export type LessonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lessons to delete
     */
    where?: LessonWhereInput
  }

  /**
   * Lesson.userProgress
   */
  export type Lesson$userProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    where?: UserProgressWhereInput
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    cursor?: UserProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * Lesson without action
   */
  export type LessonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lesson
     */
    select?: LessonSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LessonInclude<ExtArgs> | null
  }


  /**
   * Model UserProgress
   */

  export type AggregateUserProgress = {
    _count: UserProgressCountAggregateOutputType | null
    _min: UserProgressMinAggregateOutputType | null
    _max: UserProgressMaxAggregateOutputType | null
  }

  export type UserProgressMinAggregateOutputType = {
    id: string | null
    isCompleted: boolean | null
    userId: string | null
    lessonId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserProgressMaxAggregateOutputType = {
    id: string | null
    isCompleted: boolean | null
    userId: string | null
    lessonId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserProgressCountAggregateOutputType = {
    id: number
    isCompleted: number
    userId: number
    lessonId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserProgressMinAggregateInputType = {
    id?: true
    isCompleted?: true
    userId?: true
    lessonId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserProgressMaxAggregateInputType = {
    id?: true
    isCompleted?: true
    userId?: true
    lessonId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserProgressCountAggregateInputType = {
    id?: true
    isCompleted?: true
    userId?: true
    lessonId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserProgressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProgress to aggregate.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProgresses
    **/
    _count?: true | UserProgressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProgressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProgressMaxAggregateInputType
  }

  export type GetUserProgressAggregateType<T extends UserProgressAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProgress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProgress[P]>
      : GetScalarType<T[P], AggregateUserProgress[P]>
  }




  export type UserProgressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProgressWhereInput
    orderBy?: UserProgressOrderByWithAggregationInput | UserProgressOrderByWithAggregationInput[]
    by: UserProgressScalarFieldEnum[] | UserProgressScalarFieldEnum
    having?: UserProgressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProgressCountAggregateInputType | true
    _min?: UserProgressMinAggregateInputType
    _max?: UserProgressMaxAggregateInputType
  }

  export type UserProgressGroupByOutputType = {
    id: string
    isCompleted: boolean
    userId: string
    lessonId: string
    createdAt: Date
    updatedAt: Date
    _count: UserProgressCountAggregateOutputType | null
    _min: UserProgressMinAggregateOutputType | null
    _max: UserProgressMaxAggregateOutputType | null
  }

  type GetUserProgressGroupByPayload<T extends UserProgressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProgressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProgressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProgressGroupByOutputType[P]>
            : GetScalarType<T[P], UserProgressGroupByOutputType[P]>
        }
      >
    >


  export type UserProgressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isCompleted?: boolean
    userId?: boolean
    lessonId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    lesson?: boolean | LessonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProgress"]>

  export type UserProgressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    isCompleted?: boolean
    userId?: boolean
    lessonId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    lesson?: boolean | LessonDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProgress"]>

  export type UserProgressSelectScalar = {
    id?: boolean
    isCompleted?: boolean
    userId?: boolean
    lessonId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserProgressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    lesson?: boolean | LessonDefaultArgs<ExtArgs>
  }
  export type UserProgressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    lesson?: boolean | LessonDefaultArgs<ExtArgs>
  }

  export type $UserProgressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProgress"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      lesson: Prisma.$LessonPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      isCompleted: boolean
      userId: string
      lessonId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userProgress"]>
    composites: {}
  }

  type UserProgressGetPayload<S extends boolean | null | undefined | UserProgressDefaultArgs> = $Result.GetResult<Prisma.$UserProgressPayload, S>

  type UserProgressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserProgressFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserProgressCountAggregateInputType | true
    }

  export interface UserProgressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProgress'], meta: { name: 'UserProgress' } }
    /**
     * Find zero or one UserProgress that matches the filter.
     * @param {UserProgressFindUniqueArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProgressFindUniqueArgs>(args: SelectSubset<T, UserProgressFindUniqueArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserProgress that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserProgressFindUniqueOrThrowArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProgressFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProgressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserProgress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressFindFirstArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProgressFindFirstArgs>(args?: SelectSubset<T, UserProgressFindFirstArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserProgress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressFindFirstOrThrowArgs} args - Arguments to find a UserProgress
     * @example
     * // Get one UserProgress
     * const userProgress = await prisma.userProgress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProgressFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProgressFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserProgresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProgresses
     * const userProgresses = await prisma.userProgress.findMany()
     * 
     * // Get first 10 UserProgresses
     * const userProgresses = await prisma.userProgress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProgressWithIdOnly = await prisma.userProgress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProgressFindManyArgs>(args?: SelectSubset<T, UserProgressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserProgress.
     * @param {UserProgressCreateArgs} args - Arguments to create a UserProgress.
     * @example
     * // Create one UserProgress
     * const UserProgress = await prisma.userProgress.create({
     *   data: {
     *     // ... data to create a UserProgress
     *   }
     * })
     * 
     */
    create<T extends UserProgressCreateArgs>(args: SelectSubset<T, UserProgressCreateArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserProgresses.
     * @param {UserProgressCreateManyArgs} args - Arguments to create many UserProgresses.
     * @example
     * // Create many UserProgresses
     * const userProgress = await prisma.userProgress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProgressCreateManyArgs>(args?: SelectSubset<T, UserProgressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProgresses and returns the data saved in the database.
     * @param {UserProgressCreateManyAndReturnArgs} args - Arguments to create many UserProgresses.
     * @example
     * // Create many UserProgresses
     * const userProgress = await prisma.userProgress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProgresses and only return the `id`
     * const userProgressWithIdOnly = await prisma.userProgress.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProgressCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProgressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserProgress.
     * @param {UserProgressDeleteArgs} args - Arguments to delete one UserProgress.
     * @example
     * // Delete one UserProgress
     * const UserProgress = await prisma.userProgress.delete({
     *   where: {
     *     // ... filter to delete one UserProgress
     *   }
     * })
     * 
     */
    delete<T extends UserProgressDeleteArgs>(args: SelectSubset<T, UserProgressDeleteArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserProgress.
     * @param {UserProgressUpdateArgs} args - Arguments to update one UserProgress.
     * @example
     * // Update one UserProgress
     * const userProgress = await prisma.userProgress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProgressUpdateArgs>(args: SelectSubset<T, UserProgressUpdateArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserProgresses.
     * @param {UserProgressDeleteManyArgs} args - Arguments to filter UserProgresses to delete.
     * @example
     * // Delete a few UserProgresses
     * const { count } = await prisma.userProgress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProgressDeleteManyArgs>(args?: SelectSubset<T, UserProgressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProgresses
     * const userProgress = await prisma.userProgress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProgressUpdateManyArgs>(args: SelectSubset<T, UserProgressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserProgress.
     * @param {UserProgressUpsertArgs} args - Arguments to update or create a UserProgress.
     * @example
     * // Update or create a UserProgress
     * const userProgress = await prisma.userProgress.upsert({
     *   create: {
     *     // ... data to create a UserProgress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProgress we want to update
     *   }
     * })
     */
    upsert<T extends UserProgressUpsertArgs>(args: SelectSubset<T, UserProgressUpsertArgs<ExtArgs>>): Prisma__UserProgressClient<$Result.GetResult<Prisma.$UserProgressPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserProgresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressCountArgs} args - Arguments to filter UserProgresses to count.
     * @example
     * // Count the number of UserProgresses
     * const count = await prisma.userProgress.count({
     *   where: {
     *     // ... the filter for the UserProgresses we want to count
     *   }
     * })
    **/
    count<T extends UserProgressCountArgs>(
      args?: Subset<T, UserProgressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProgressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProgressAggregateArgs>(args: Subset<T, UserProgressAggregateArgs>): Prisma.PrismaPromise<GetUserProgressAggregateType<T>>

    /**
     * Group by UserProgress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProgressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProgressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProgressGroupByArgs['orderBy'] }
        : { orderBy?: UserProgressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProgressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProgressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProgress model
   */
  readonly fields: UserProgressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProgress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProgressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    lesson<T extends LessonDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LessonDefaultArgs<ExtArgs>>): Prisma__LessonClient<$Result.GetResult<Prisma.$LessonPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProgress model
   */ 
  interface UserProgressFieldRefs {
    readonly id: FieldRef<"UserProgress", 'String'>
    readonly isCompleted: FieldRef<"UserProgress", 'Boolean'>
    readonly userId: FieldRef<"UserProgress", 'String'>
    readonly lessonId: FieldRef<"UserProgress", 'String'>
    readonly createdAt: FieldRef<"UserProgress", 'DateTime'>
    readonly updatedAt: FieldRef<"UserProgress", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserProgress findUnique
   */
  export type UserProgressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress findUniqueOrThrow
   */
  export type UserProgressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress findFirst
   */
  export type UserProgressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProgresses.
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProgresses.
     */
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * UserProgress findFirstOrThrow
   */
  export type UserProgressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgress to fetch.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProgresses.
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProgresses.
     */
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * UserProgress findMany
   */
  export type UserProgressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter, which UserProgresses to fetch.
     */
    where?: UserProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProgresses to fetch.
     */
    orderBy?: UserProgressOrderByWithRelationInput | UserProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProgresses.
     */
    cursor?: UserProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProgresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProgresses.
     */
    skip?: number
    distinct?: UserProgressScalarFieldEnum | UserProgressScalarFieldEnum[]
  }

  /**
   * UserProgress create
   */
  export type UserProgressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProgress.
     */
    data: XOR<UserProgressCreateInput, UserProgressUncheckedCreateInput>
  }

  /**
   * UserProgress createMany
   */
  export type UserProgressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProgresses.
     */
    data: UserProgressCreateManyInput | UserProgressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProgress createManyAndReturn
   */
  export type UserProgressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserProgresses.
     */
    data: UserProgressCreateManyInput | UserProgressCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProgress update
   */
  export type UserProgressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProgress.
     */
    data: XOR<UserProgressUpdateInput, UserProgressUncheckedUpdateInput>
    /**
     * Choose, which UserProgress to update.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress updateMany
   */
  export type UserProgressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProgresses.
     */
    data: XOR<UserProgressUpdateManyMutationInput, UserProgressUncheckedUpdateManyInput>
    /**
     * Filter which UserProgresses to update
     */
    where?: UserProgressWhereInput
  }

  /**
   * UserProgress upsert
   */
  export type UserProgressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProgress to update in case it exists.
     */
    where: UserProgressWhereUniqueInput
    /**
     * In case the UserProgress found by the `where` argument doesn't exist, create a new UserProgress with this data.
     */
    create: XOR<UserProgressCreateInput, UserProgressUncheckedCreateInput>
    /**
     * In case the UserProgress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProgressUpdateInput, UserProgressUncheckedUpdateInput>
  }

  /**
   * UserProgress delete
   */
  export type UserProgressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
    /**
     * Filter which UserProgress to delete.
     */
    where: UserProgressWhereUniqueInput
  }

  /**
   * UserProgress deleteMany
   */
  export type UserProgressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProgresses to delete
     */
    where?: UserProgressWhereInput
  }

  /**
   * UserProgress without action
   */
  export type UserProgressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProgress
     */
    select?: UserProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProgressInclude<ExtArgs> | null
  }


  /**
   * Model DeletionInfo
   */

  export type AggregateDeletionInfo = {
    _count: DeletionInfoCountAggregateOutputType | null
    _min: DeletionInfoMinAggregateOutputType | null
    _max: DeletionInfoMaxAggregateOutputType | null
  }

  export type DeletionInfoMinAggregateOutputType = {
    id: string | null
    status: $Enums.DeletionStatus | null
    token: string | null
    expiry: Date | null
    after: Date | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DeletionInfoMaxAggregateOutputType = {
    id: string | null
    status: $Enums.DeletionStatus | null
    token: string | null
    expiry: Date | null
    after: Date | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DeletionInfoCountAggregateOutputType = {
    id: number
    status: number
    token: number
    expiry: number
    after: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DeletionInfoMinAggregateInputType = {
    id?: true
    status?: true
    token?: true
    expiry?: true
    after?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DeletionInfoMaxAggregateInputType = {
    id?: true
    status?: true
    token?: true
    expiry?: true
    after?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DeletionInfoCountAggregateInputType = {
    id?: true
    status?: true
    token?: true
    expiry?: true
    after?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DeletionInfoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeletionInfo to aggregate.
     */
    where?: DeletionInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeletionInfos to fetch.
     */
    orderBy?: DeletionInfoOrderByWithRelationInput | DeletionInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeletionInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeletionInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeletionInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeletionInfos
    **/
    _count?: true | DeletionInfoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeletionInfoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeletionInfoMaxAggregateInputType
  }

  export type GetDeletionInfoAggregateType<T extends DeletionInfoAggregateArgs> = {
        [P in keyof T & keyof AggregateDeletionInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeletionInfo[P]>
      : GetScalarType<T[P], AggregateDeletionInfo[P]>
  }




  export type DeletionInfoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeletionInfoWhereInput
    orderBy?: DeletionInfoOrderByWithAggregationInput | DeletionInfoOrderByWithAggregationInput[]
    by: DeletionInfoScalarFieldEnum[] | DeletionInfoScalarFieldEnum
    having?: DeletionInfoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeletionInfoCountAggregateInputType | true
    _min?: DeletionInfoMinAggregateInputType
    _max?: DeletionInfoMaxAggregateInputType
  }

  export type DeletionInfoGroupByOutputType = {
    id: string
    status: $Enums.DeletionStatus
    token: string | null
    expiry: Date | null
    after: Date | null
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: DeletionInfoCountAggregateOutputType | null
    _min: DeletionInfoMinAggregateOutputType | null
    _max: DeletionInfoMaxAggregateOutputType | null
  }

  type GetDeletionInfoGroupByPayload<T extends DeletionInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeletionInfoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeletionInfoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeletionInfoGroupByOutputType[P]>
            : GetScalarType<T[P], DeletionInfoGroupByOutputType[P]>
        }
      >
    >


  export type DeletionInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    token?: boolean
    expiry?: boolean
    after?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deletionInfo"]>

  export type DeletionInfoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    token?: boolean
    expiry?: boolean
    after?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["deletionInfo"]>

  export type DeletionInfoSelectScalar = {
    id?: boolean
    status?: boolean
    token?: boolean
    expiry?: boolean
    after?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DeletionInfoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DeletionInfoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DeletionInfoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeletionInfo"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      status: $Enums.DeletionStatus
      token: string | null
      expiry: Date | null
      after: Date | null
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["deletionInfo"]>
    composites: {}
  }

  type DeletionInfoGetPayload<S extends boolean | null | undefined | DeletionInfoDefaultArgs> = $Result.GetResult<Prisma.$DeletionInfoPayload, S>

  type DeletionInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DeletionInfoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DeletionInfoCountAggregateInputType | true
    }

  export interface DeletionInfoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeletionInfo'], meta: { name: 'DeletionInfo' } }
    /**
     * Find zero or one DeletionInfo that matches the filter.
     * @param {DeletionInfoFindUniqueArgs} args - Arguments to find a DeletionInfo
     * @example
     * // Get one DeletionInfo
     * const deletionInfo = await prisma.deletionInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeletionInfoFindUniqueArgs>(args: SelectSubset<T, DeletionInfoFindUniqueArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DeletionInfo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DeletionInfoFindUniqueOrThrowArgs} args - Arguments to find a DeletionInfo
     * @example
     * // Get one DeletionInfo
     * const deletionInfo = await prisma.deletionInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeletionInfoFindUniqueOrThrowArgs>(args: SelectSubset<T, DeletionInfoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DeletionInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoFindFirstArgs} args - Arguments to find a DeletionInfo
     * @example
     * // Get one DeletionInfo
     * const deletionInfo = await prisma.deletionInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeletionInfoFindFirstArgs>(args?: SelectSubset<T, DeletionInfoFindFirstArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DeletionInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoFindFirstOrThrowArgs} args - Arguments to find a DeletionInfo
     * @example
     * // Get one DeletionInfo
     * const deletionInfo = await prisma.deletionInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeletionInfoFindFirstOrThrowArgs>(args?: SelectSubset<T, DeletionInfoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DeletionInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeletionInfos
     * const deletionInfos = await prisma.deletionInfo.findMany()
     * 
     * // Get first 10 DeletionInfos
     * const deletionInfos = await prisma.deletionInfo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deletionInfoWithIdOnly = await prisma.deletionInfo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeletionInfoFindManyArgs>(args?: SelectSubset<T, DeletionInfoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DeletionInfo.
     * @param {DeletionInfoCreateArgs} args - Arguments to create a DeletionInfo.
     * @example
     * // Create one DeletionInfo
     * const DeletionInfo = await prisma.deletionInfo.create({
     *   data: {
     *     // ... data to create a DeletionInfo
     *   }
     * })
     * 
     */
    create<T extends DeletionInfoCreateArgs>(args: SelectSubset<T, DeletionInfoCreateArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DeletionInfos.
     * @param {DeletionInfoCreateManyArgs} args - Arguments to create many DeletionInfos.
     * @example
     * // Create many DeletionInfos
     * const deletionInfo = await prisma.deletionInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeletionInfoCreateManyArgs>(args?: SelectSubset<T, DeletionInfoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeletionInfos and returns the data saved in the database.
     * @param {DeletionInfoCreateManyAndReturnArgs} args - Arguments to create many DeletionInfos.
     * @example
     * // Create many DeletionInfos
     * const deletionInfo = await prisma.deletionInfo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DeletionInfos and only return the `id`
     * const deletionInfoWithIdOnly = await prisma.deletionInfo.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeletionInfoCreateManyAndReturnArgs>(args?: SelectSubset<T, DeletionInfoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DeletionInfo.
     * @param {DeletionInfoDeleteArgs} args - Arguments to delete one DeletionInfo.
     * @example
     * // Delete one DeletionInfo
     * const DeletionInfo = await prisma.deletionInfo.delete({
     *   where: {
     *     // ... filter to delete one DeletionInfo
     *   }
     * })
     * 
     */
    delete<T extends DeletionInfoDeleteArgs>(args: SelectSubset<T, DeletionInfoDeleteArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DeletionInfo.
     * @param {DeletionInfoUpdateArgs} args - Arguments to update one DeletionInfo.
     * @example
     * // Update one DeletionInfo
     * const deletionInfo = await prisma.deletionInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeletionInfoUpdateArgs>(args: SelectSubset<T, DeletionInfoUpdateArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DeletionInfos.
     * @param {DeletionInfoDeleteManyArgs} args - Arguments to filter DeletionInfos to delete.
     * @example
     * // Delete a few DeletionInfos
     * const { count } = await prisma.deletionInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeletionInfoDeleteManyArgs>(args?: SelectSubset<T, DeletionInfoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeletionInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeletionInfos
     * const deletionInfo = await prisma.deletionInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeletionInfoUpdateManyArgs>(args: SelectSubset<T, DeletionInfoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DeletionInfo.
     * @param {DeletionInfoUpsertArgs} args - Arguments to update or create a DeletionInfo.
     * @example
     * // Update or create a DeletionInfo
     * const deletionInfo = await prisma.deletionInfo.upsert({
     *   create: {
     *     // ... data to create a DeletionInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeletionInfo we want to update
     *   }
     * })
     */
    upsert<T extends DeletionInfoUpsertArgs>(args: SelectSubset<T, DeletionInfoUpsertArgs<ExtArgs>>): Prisma__DeletionInfoClient<$Result.GetResult<Prisma.$DeletionInfoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DeletionInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoCountArgs} args - Arguments to filter DeletionInfos to count.
     * @example
     * // Count the number of DeletionInfos
     * const count = await prisma.deletionInfo.count({
     *   where: {
     *     // ... the filter for the DeletionInfos we want to count
     *   }
     * })
    **/
    count<T extends DeletionInfoCountArgs>(
      args?: Subset<T, DeletionInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeletionInfoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeletionInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DeletionInfoAggregateArgs>(args: Subset<T, DeletionInfoAggregateArgs>): Prisma.PrismaPromise<GetDeletionInfoAggregateType<T>>

    /**
     * Group by DeletionInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeletionInfoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DeletionInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeletionInfoGroupByArgs['orderBy'] }
        : { orderBy?: DeletionInfoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DeletionInfoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeletionInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeletionInfo model
   */
  readonly fields: DeletionInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeletionInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeletionInfoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DeletionInfo model
   */ 
  interface DeletionInfoFieldRefs {
    readonly id: FieldRef<"DeletionInfo", 'String'>
    readonly status: FieldRef<"DeletionInfo", 'DeletionStatus'>
    readonly token: FieldRef<"DeletionInfo", 'String'>
    readonly expiry: FieldRef<"DeletionInfo", 'DateTime'>
    readonly after: FieldRef<"DeletionInfo", 'DateTime'>
    readonly userId: FieldRef<"DeletionInfo", 'String'>
    readonly createdAt: FieldRef<"DeletionInfo", 'DateTime'>
    readonly updatedAt: FieldRef<"DeletionInfo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DeletionInfo findUnique
   */
  export type DeletionInfoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * Filter, which DeletionInfo to fetch.
     */
    where: DeletionInfoWhereUniqueInput
  }

  /**
   * DeletionInfo findUniqueOrThrow
   */
  export type DeletionInfoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * Filter, which DeletionInfo to fetch.
     */
    where: DeletionInfoWhereUniqueInput
  }

  /**
   * DeletionInfo findFirst
   */
  export type DeletionInfoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * Filter, which DeletionInfo to fetch.
     */
    where?: DeletionInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeletionInfos to fetch.
     */
    orderBy?: DeletionInfoOrderByWithRelationInput | DeletionInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeletionInfos.
     */
    cursor?: DeletionInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeletionInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeletionInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeletionInfos.
     */
    distinct?: DeletionInfoScalarFieldEnum | DeletionInfoScalarFieldEnum[]
  }

  /**
   * DeletionInfo findFirstOrThrow
   */
  export type DeletionInfoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * Filter, which DeletionInfo to fetch.
     */
    where?: DeletionInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeletionInfos to fetch.
     */
    orderBy?: DeletionInfoOrderByWithRelationInput | DeletionInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeletionInfos.
     */
    cursor?: DeletionInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeletionInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeletionInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeletionInfos.
     */
    distinct?: DeletionInfoScalarFieldEnum | DeletionInfoScalarFieldEnum[]
  }

  /**
   * DeletionInfo findMany
   */
  export type DeletionInfoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * Filter, which DeletionInfos to fetch.
     */
    where?: DeletionInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeletionInfos to fetch.
     */
    orderBy?: DeletionInfoOrderByWithRelationInput | DeletionInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeletionInfos.
     */
    cursor?: DeletionInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeletionInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeletionInfos.
     */
    skip?: number
    distinct?: DeletionInfoScalarFieldEnum | DeletionInfoScalarFieldEnum[]
  }

  /**
   * DeletionInfo create
   */
  export type DeletionInfoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * The data needed to create a DeletionInfo.
     */
    data: XOR<DeletionInfoCreateInput, DeletionInfoUncheckedCreateInput>
  }

  /**
   * DeletionInfo createMany
   */
  export type DeletionInfoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeletionInfos.
     */
    data: DeletionInfoCreateManyInput | DeletionInfoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DeletionInfo createManyAndReturn
   */
  export type DeletionInfoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DeletionInfos.
     */
    data: DeletionInfoCreateManyInput | DeletionInfoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DeletionInfo update
   */
  export type DeletionInfoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * The data needed to update a DeletionInfo.
     */
    data: XOR<DeletionInfoUpdateInput, DeletionInfoUncheckedUpdateInput>
    /**
     * Choose, which DeletionInfo to update.
     */
    where: DeletionInfoWhereUniqueInput
  }

  /**
   * DeletionInfo updateMany
   */
  export type DeletionInfoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeletionInfos.
     */
    data: XOR<DeletionInfoUpdateManyMutationInput, DeletionInfoUncheckedUpdateManyInput>
    /**
     * Filter which DeletionInfos to update
     */
    where?: DeletionInfoWhereInput
  }

  /**
   * DeletionInfo upsert
   */
  export type DeletionInfoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * The filter to search for the DeletionInfo to update in case it exists.
     */
    where: DeletionInfoWhereUniqueInput
    /**
     * In case the DeletionInfo found by the `where` argument doesn't exist, create a new DeletionInfo with this data.
     */
    create: XOR<DeletionInfoCreateInput, DeletionInfoUncheckedCreateInput>
    /**
     * In case the DeletionInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeletionInfoUpdateInput, DeletionInfoUncheckedUpdateInput>
  }

  /**
   * DeletionInfo delete
   */
  export type DeletionInfoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
    /**
     * Filter which DeletionInfo to delete.
     */
    where: DeletionInfoWhereUniqueInput
  }

  /**
   * DeletionInfo deleteMany
   */
  export type DeletionInfoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeletionInfos to delete
     */
    where?: DeletionInfoWhereInput
  }

  /**
   * DeletionInfo without action
   */
  export type DeletionInfoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeletionInfo
     */
    select?: DeletionInfoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DeletionInfoInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    username: 'username',
    displayName: 'displayName',
    avatar: 'avatar',
    points: 'points',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const PasswordResetScalarFieldEnum: {
    id: 'id',
    token: 'token',
    expiry: 'expiry',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PasswordResetScalarFieldEnum = (typeof PasswordResetScalarFieldEnum)[keyof typeof PasswordResetScalarFieldEnum]


  export const MultiFactorAuthenticationScalarFieldEnum: {
    id: 'id',
    recoveryCodes: 'recoveryCodes',
    totpId: 'totpId',
    passkeyId: 'passkeyId',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MultiFactorAuthenticationScalarFieldEnum = (typeof MultiFactorAuthenticationScalarFieldEnum)[keyof typeof MultiFactorAuthenticationScalarFieldEnum]


  export const PasskeyScalarFieldEnum: {
    id: 'id',
    publicKey: 'publicKey',
    privateKey: 'privateKey',
    isActivated: 'isActivated',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PasskeyScalarFieldEnum = (typeof PasskeyScalarFieldEnum)[keyof typeof PasskeyScalarFieldEnum]


  export const TotpScalarFieldEnum: {
    id: 'id',
    status: 'status',
    secret: 'secret',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TotpScalarFieldEnum = (typeof TotpScalarFieldEnum)[keyof typeof TotpScalarFieldEnum]


  export const CourseScalarFieldEnum: {
    id: 'id',
    title: 'title',
    slug: 'slug',
    description: 'description',
    thumbnail: 'thumbnail',
    youtubeUrl: 'youtubeUrl',
    codeUrl: 'codeUrl',
    isPublished: 'isPublished',
    views: 'views',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum]


  export const LessonScalarFieldEnum: {
    id: 'id',
    title: 'title',
    slug: 'slug',
    description: 'description',
    position: 'position',
    kinescopeId: 'kinescopeId',
    isPublished: 'isPublished',
    courseId: 'courseId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LessonScalarFieldEnum = (typeof LessonScalarFieldEnum)[keyof typeof LessonScalarFieldEnum]


  export const UserProgressScalarFieldEnum: {
    id: 'id',
    isCompleted: 'isCompleted',
    userId: 'userId',
    lessonId: 'lessonId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserProgressScalarFieldEnum = (typeof UserProgressScalarFieldEnum)[keyof typeof UserProgressScalarFieldEnum]


  export const DeletionInfoScalarFieldEnum: {
    id: 'id',
    status: 'status',
    token: 'token',
    expiry: 'expiry',
    after: 'after',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DeletionInfoScalarFieldEnum = (typeof DeletionInfoScalarFieldEnum)[keyof typeof DeletionInfoScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'TotpStatus'
   */
  export type EnumTotpStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TotpStatus'>
    


  /**
   * Reference to a field of type 'TotpStatus[]'
   */
  export type ListEnumTotpStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TotpStatus[]'>
    


  /**
   * Reference to a field of type 'DeletionStatus'
   */
  export type EnumDeletionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeletionStatus'>
    


  /**
   * Reference to a field of type 'DeletionStatus[]'
   */
  export type ListEnumDeletionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeletionStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringNullableFilter<"User"> | string | null
    username?: StringFilter<"User"> | string
    displayName?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    points?: IntFilter<"User"> | number
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    userProgress?: UserProgressListRelationFilter
    passwordReset?: XOR<PasswordResetNullableRelationFilter, PasswordResetWhereInput> | null
    mfa?: XOR<MultiFactorAuthenticationNullableRelationFilter, MultiFactorAuthenticationWhereInput> | null
    deletionInfo?: XOR<DeletionInfoNullableRelationFilter, DeletionInfoWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrderInput | SortOrder
    username?: SortOrder
    displayName?: SortOrder
    avatar?: SortOrderInput | SortOrder
    points?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userProgress?: UserProgressOrderByRelationAggregateInput
    passwordReset?: PasswordResetOrderByWithRelationInput
    mfa?: MultiFactorAuthenticationOrderByWithRelationInput
    deletionInfo?: DeletionInfoOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringNullableFilter<"User"> | string | null
    displayName?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    points?: IntFilter<"User"> | number
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    userProgress?: UserProgressListRelationFilter
    passwordReset?: XOR<PasswordResetNullableRelationFilter, PasswordResetWhereInput> | null
    mfa?: XOR<MultiFactorAuthenticationNullableRelationFilter, MultiFactorAuthenticationWhereInput> | null
    deletionInfo?: XOR<DeletionInfoNullableRelationFilter, DeletionInfoWhereInput> | null
  }, "id" | "email" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrderInput | SortOrder
    username?: SortOrder
    displayName?: SortOrder
    avatar?: SortOrderInput | SortOrder
    points?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringNullableWithAggregatesFilter<"User"> | string | null
    username?: StringWithAggregatesFilter<"User"> | string
    displayName?: StringWithAggregatesFilter<"User"> | string
    avatar?: StringNullableWithAggregatesFilter<"User"> | string | null
    points?: IntWithAggregatesFilter<"User"> | number
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type PasswordResetWhereInput = {
    AND?: PasswordResetWhereInput | PasswordResetWhereInput[]
    OR?: PasswordResetWhereInput[]
    NOT?: PasswordResetWhereInput | PasswordResetWhereInput[]
    id?: StringFilter<"PasswordReset"> | string
    token?: StringFilter<"PasswordReset"> | string
    expiry?: DateTimeFilter<"PasswordReset"> | Date | string
    userId?: StringFilter<"PasswordReset"> | string
    createdAt?: DateTimeFilter<"PasswordReset"> | Date | string
    updatedAt?: DateTimeFilter<"PasswordReset"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type PasswordResetOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PasswordResetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    userId?: string
    AND?: PasswordResetWhereInput | PasswordResetWhereInput[]
    OR?: PasswordResetWhereInput[]
    NOT?: PasswordResetWhereInput | PasswordResetWhereInput[]
    expiry?: DateTimeFilter<"PasswordReset"> | Date | string
    createdAt?: DateTimeFilter<"PasswordReset"> | Date | string
    updatedAt?: DateTimeFilter<"PasswordReset"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "token" | "userId">

  export type PasswordResetOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PasswordResetCountOrderByAggregateInput
    _max?: PasswordResetMaxOrderByAggregateInput
    _min?: PasswordResetMinOrderByAggregateInput
  }

  export type PasswordResetScalarWhereWithAggregatesInput = {
    AND?: PasswordResetScalarWhereWithAggregatesInput | PasswordResetScalarWhereWithAggregatesInput[]
    OR?: PasswordResetScalarWhereWithAggregatesInput[]
    NOT?: PasswordResetScalarWhereWithAggregatesInput | PasswordResetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PasswordReset"> | string
    token?: StringWithAggregatesFilter<"PasswordReset"> | string
    expiry?: DateTimeWithAggregatesFilter<"PasswordReset"> | Date | string
    userId?: StringWithAggregatesFilter<"PasswordReset"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PasswordReset"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PasswordReset"> | Date | string
  }

  export type MultiFactorAuthenticationWhereInput = {
    AND?: MultiFactorAuthenticationWhereInput | MultiFactorAuthenticationWhereInput[]
    OR?: MultiFactorAuthenticationWhereInput[]
    NOT?: MultiFactorAuthenticationWhereInput | MultiFactorAuthenticationWhereInput[]
    id?: StringFilter<"MultiFactorAuthentication"> | string
    recoveryCodes?: StringNullableListFilter<"MultiFactorAuthentication">
    totpId?: StringNullableFilter<"MultiFactorAuthentication"> | string | null
    passkeyId?: StringNullableFilter<"MultiFactorAuthentication"> | string | null
    userId?: StringFilter<"MultiFactorAuthentication"> | string
    createdAt?: DateTimeFilter<"MultiFactorAuthentication"> | Date | string
    updatedAt?: DateTimeFilter<"MultiFactorAuthentication"> | Date | string
    totp?: XOR<TotpNullableRelationFilter, TotpWhereInput> | null
    passkey?: XOR<PasskeyNullableRelationFilter, PasskeyWhereInput> | null
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type MultiFactorAuthenticationOrderByWithRelationInput = {
    id?: SortOrder
    recoveryCodes?: SortOrder
    totpId?: SortOrderInput | SortOrder
    passkeyId?: SortOrderInput | SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    totp?: TotpOrderByWithRelationInput
    passkey?: PasskeyOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type MultiFactorAuthenticationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    totpId?: string
    passkeyId?: string
    userId?: string
    AND?: MultiFactorAuthenticationWhereInput | MultiFactorAuthenticationWhereInput[]
    OR?: MultiFactorAuthenticationWhereInput[]
    NOT?: MultiFactorAuthenticationWhereInput | MultiFactorAuthenticationWhereInput[]
    recoveryCodes?: StringNullableListFilter<"MultiFactorAuthentication">
    createdAt?: DateTimeFilter<"MultiFactorAuthentication"> | Date | string
    updatedAt?: DateTimeFilter<"MultiFactorAuthentication"> | Date | string
    totp?: XOR<TotpNullableRelationFilter, TotpWhereInput> | null
    passkey?: XOR<PasskeyNullableRelationFilter, PasskeyWhereInput> | null
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "totpId" | "passkeyId" | "userId">

  export type MultiFactorAuthenticationOrderByWithAggregationInput = {
    id?: SortOrder
    recoveryCodes?: SortOrder
    totpId?: SortOrderInput | SortOrder
    passkeyId?: SortOrderInput | SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MultiFactorAuthenticationCountOrderByAggregateInput
    _max?: MultiFactorAuthenticationMaxOrderByAggregateInput
    _min?: MultiFactorAuthenticationMinOrderByAggregateInput
  }

  export type MultiFactorAuthenticationScalarWhereWithAggregatesInput = {
    AND?: MultiFactorAuthenticationScalarWhereWithAggregatesInput | MultiFactorAuthenticationScalarWhereWithAggregatesInput[]
    OR?: MultiFactorAuthenticationScalarWhereWithAggregatesInput[]
    NOT?: MultiFactorAuthenticationScalarWhereWithAggregatesInput | MultiFactorAuthenticationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MultiFactorAuthentication"> | string
    recoveryCodes?: StringNullableListFilter<"MultiFactorAuthentication">
    totpId?: StringNullableWithAggregatesFilter<"MultiFactorAuthentication"> | string | null
    passkeyId?: StringNullableWithAggregatesFilter<"MultiFactorAuthentication"> | string | null
    userId?: StringWithAggregatesFilter<"MultiFactorAuthentication"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MultiFactorAuthentication"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MultiFactorAuthentication"> | Date | string
  }

  export type PasskeyWhereInput = {
    AND?: PasskeyWhereInput | PasskeyWhereInput[]
    OR?: PasskeyWhereInput[]
    NOT?: PasskeyWhereInput | PasskeyWhereInput[]
    id?: StringFilter<"Passkey"> | string
    publicKey?: StringFilter<"Passkey"> | string
    privateKey?: StringFilter<"Passkey"> | string
    isActivated?: BoolFilter<"Passkey"> | boolean
    createdAt?: DateTimeFilter<"Passkey"> | Date | string
    updatedAt?: DateTimeFilter<"Passkey"> | Date | string
    mfa?: XOR<MultiFactorAuthenticationNullableRelationFilter, MultiFactorAuthenticationWhereInput> | null
  }

  export type PasskeyOrderByWithRelationInput = {
    id?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    isActivated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfa?: MultiFactorAuthenticationOrderByWithRelationInput
  }

  export type PasskeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PasskeyWhereInput | PasskeyWhereInput[]
    OR?: PasskeyWhereInput[]
    NOT?: PasskeyWhereInput | PasskeyWhereInput[]
    publicKey?: StringFilter<"Passkey"> | string
    privateKey?: StringFilter<"Passkey"> | string
    isActivated?: BoolFilter<"Passkey"> | boolean
    createdAt?: DateTimeFilter<"Passkey"> | Date | string
    updatedAt?: DateTimeFilter<"Passkey"> | Date | string
    mfa?: XOR<MultiFactorAuthenticationNullableRelationFilter, MultiFactorAuthenticationWhereInput> | null
  }, "id">

  export type PasskeyOrderByWithAggregationInput = {
    id?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    isActivated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PasskeyCountOrderByAggregateInput
    _max?: PasskeyMaxOrderByAggregateInput
    _min?: PasskeyMinOrderByAggregateInput
  }

  export type PasskeyScalarWhereWithAggregatesInput = {
    AND?: PasskeyScalarWhereWithAggregatesInput | PasskeyScalarWhereWithAggregatesInput[]
    OR?: PasskeyScalarWhereWithAggregatesInput[]
    NOT?: PasskeyScalarWhereWithAggregatesInput | PasskeyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Passkey"> | string
    publicKey?: StringWithAggregatesFilter<"Passkey"> | string
    privateKey?: StringWithAggregatesFilter<"Passkey"> | string
    isActivated?: BoolWithAggregatesFilter<"Passkey"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Passkey"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Passkey"> | Date | string
  }

  export type TotpWhereInput = {
    AND?: TotpWhereInput | TotpWhereInput[]
    OR?: TotpWhereInput[]
    NOT?: TotpWhereInput | TotpWhereInput[]
    id?: StringFilter<"Totp"> | string
    status?: EnumTotpStatusFilter<"Totp"> | $Enums.TotpStatus
    secret?: StringNullableFilter<"Totp"> | string | null
    createdAt?: DateTimeFilter<"Totp"> | Date | string
    updatedAt?: DateTimeFilter<"Totp"> | Date | string
    mfa?: XOR<MultiFactorAuthenticationNullableRelationFilter, MultiFactorAuthenticationWhereInput> | null
  }

  export type TotpOrderByWithRelationInput = {
    id?: SortOrder
    status?: SortOrder
    secret?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfa?: MultiFactorAuthenticationOrderByWithRelationInput
  }

  export type TotpWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TotpWhereInput | TotpWhereInput[]
    OR?: TotpWhereInput[]
    NOT?: TotpWhereInput | TotpWhereInput[]
    status?: EnumTotpStatusFilter<"Totp"> | $Enums.TotpStatus
    secret?: StringNullableFilter<"Totp"> | string | null
    createdAt?: DateTimeFilter<"Totp"> | Date | string
    updatedAt?: DateTimeFilter<"Totp"> | Date | string
    mfa?: XOR<MultiFactorAuthenticationNullableRelationFilter, MultiFactorAuthenticationWhereInput> | null
  }, "id">

  export type TotpOrderByWithAggregationInput = {
    id?: SortOrder
    status?: SortOrder
    secret?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TotpCountOrderByAggregateInput
    _max?: TotpMaxOrderByAggregateInput
    _min?: TotpMinOrderByAggregateInput
  }

  export type TotpScalarWhereWithAggregatesInput = {
    AND?: TotpScalarWhereWithAggregatesInput | TotpScalarWhereWithAggregatesInput[]
    OR?: TotpScalarWhereWithAggregatesInput[]
    NOT?: TotpScalarWhereWithAggregatesInput | TotpScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Totp"> | string
    status?: EnumTotpStatusWithAggregatesFilter<"Totp"> | $Enums.TotpStatus
    secret?: StringNullableWithAggregatesFilter<"Totp"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Totp"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Totp"> | Date | string
  }

  export type CourseWhereInput = {
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    id?: StringFilter<"Course"> | string
    title?: StringFilter<"Course"> | string
    slug?: StringFilter<"Course"> | string
    description?: StringNullableFilter<"Course"> | string | null
    thumbnail?: StringNullableFilter<"Course"> | string | null
    youtubeUrl?: StringNullableFilter<"Course"> | string | null
    codeUrl?: StringNullableFilter<"Course"> | string | null
    isPublished?: BoolFilter<"Course"> | boolean
    views?: IntFilter<"Course"> | number
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    lessons?: LessonListRelationFilter
  }

  export type CourseOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    thumbnail?: SortOrderInput | SortOrder
    youtubeUrl?: SortOrderInput | SortOrder
    codeUrl?: SortOrderInput | SortOrder
    isPublished?: SortOrder
    views?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lessons?: LessonOrderByRelationAggregateInput
  }

  export type CourseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    title?: StringFilter<"Course"> | string
    description?: StringNullableFilter<"Course"> | string | null
    thumbnail?: StringNullableFilter<"Course"> | string | null
    youtubeUrl?: StringNullableFilter<"Course"> | string | null
    codeUrl?: StringNullableFilter<"Course"> | string | null
    isPublished?: BoolFilter<"Course"> | boolean
    views?: IntFilter<"Course"> | number
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    lessons?: LessonListRelationFilter
  }, "id" | "slug">

  export type CourseOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    thumbnail?: SortOrderInput | SortOrder
    youtubeUrl?: SortOrderInput | SortOrder
    codeUrl?: SortOrderInput | SortOrder
    isPublished?: SortOrder
    views?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CourseCountOrderByAggregateInput
    _avg?: CourseAvgOrderByAggregateInput
    _max?: CourseMaxOrderByAggregateInput
    _min?: CourseMinOrderByAggregateInput
    _sum?: CourseSumOrderByAggregateInput
  }

  export type CourseScalarWhereWithAggregatesInput = {
    AND?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    OR?: CourseScalarWhereWithAggregatesInput[]
    NOT?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Course"> | string
    title?: StringWithAggregatesFilter<"Course"> | string
    slug?: StringWithAggregatesFilter<"Course"> | string
    description?: StringNullableWithAggregatesFilter<"Course"> | string | null
    thumbnail?: StringNullableWithAggregatesFilter<"Course"> | string | null
    youtubeUrl?: StringNullableWithAggregatesFilter<"Course"> | string | null
    codeUrl?: StringNullableWithAggregatesFilter<"Course"> | string | null
    isPublished?: BoolWithAggregatesFilter<"Course"> | boolean
    views?: IntWithAggregatesFilter<"Course"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
  }

  export type LessonWhereInput = {
    AND?: LessonWhereInput | LessonWhereInput[]
    OR?: LessonWhereInput[]
    NOT?: LessonWhereInput | LessonWhereInput[]
    id?: StringFilter<"Lesson"> | string
    title?: StringFilter<"Lesson"> | string
    slug?: StringFilter<"Lesson"> | string
    description?: StringNullableFilter<"Lesson"> | string | null
    position?: IntFilter<"Lesson"> | number
    kinescopeId?: StringNullableFilter<"Lesson"> | string | null
    isPublished?: BoolFilter<"Lesson"> | boolean
    courseId?: StringFilter<"Lesson"> | string
    createdAt?: DateTimeFilter<"Lesson"> | Date | string
    updatedAt?: DateTimeFilter<"Lesson"> | Date | string
    userProgress?: UserProgressListRelationFilter
    course?: XOR<CourseRelationFilter, CourseWhereInput>
  }

  export type LessonOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    position?: SortOrder
    kinescopeId?: SortOrderInput | SortOrder
    isPublished?: SortOrder
    courseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userProgress?: UserProgressOrderByRelationAggregateInput
    course?: CourseOrderByWithRelationInput
  }

  export type LessonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: LessonWhereInput | LessonWhereInput[]
    OR?: LessonWhereInput[]
    NOT?: LessonWhereInput | LessonWhereInput[]
    title?: StringFilter<"Lesson"> | string
    description?: StringNullableFilter<"Lesson"> | string | null
    position?: IntFilter<"Lesson"> | number
    kinescopeId?: StringNullableFilter<"Lesson"> | string | null
    isPublished?: BoolFilter<"Lesson"> | boolean
    courseId?: StringFilter<"Lesson"> | string
    createdAt?: DateTimeFilter<"Lesson"> | Date | string
    updatedAt?: DateTimeFilter<"Lesson"> | Date | string
    userProgress?: UserProgressListRelationFilter
    course?: XOR<CourseRelationFilter, CourseWhereInput>
  }, "id" | "slug">

  export type LessonOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    position?: SortOrder
    kinescopeId?: SortOrderInput | SortOrder
    isPublished?: SortOrder
    courseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LessonCountOrderByAggregateInput
    _avg?: LessonAvgOrderByAggregateInput
    _max?: LessonMaxOrderByAggregateInput
    _min?: LessonMinOrderByAggregateInput
    _sum?: LessonSumOrderByAggregateInput
  }

  export type LessonScalarWhereWithAggregatesInput = {
    AND?: LessonScalarWhereWithAggregatesInput | LessonScalarWhereWithAggregatesInput[]
    OR?: LessonScalarWhereWithAggregatesInput[]
    NOT?: LessonScalarWhereWithAggregatesInput | LessonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Lesson"> | string
    title?: StringWithAggregatesFilter<"Lesson"> | string
    slug?: StringWithAggregatesFilter<"Lesson"> | string
    description?: StringNullableWithAggregatesFilter<"Lesson"> | string | null
    position?: IntWithAggregatesFilter<"Lesson"> | number
    kinescopeId?: StringNullableWithAggregatesFilter<"Lesson"> | string | null
    isPublished?: BoolWithAggregatesFilter<"Lesson"> | boolean
    courseId?: StringWithAggregatesFilter<"Lesson"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Lesson"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Lesson"> | Date | string
  }

  export type UserProgressWhereInput = {
    AND?: UserProgressWhereInput | UserProgressWhereInput[]
    OR?: UserProgressWhereInput[]
    NOT?: UserProgressWhereInput | UserProgressWhereInput[]
    id?: StringFilter<"UserProgress"> | string
    isCompleted?: BoolFilter<"UserProgress"> | boolean
    userId?: StringFilter<"UserProgress"> | string
    lessonId?: StringFilter<"UserProgress"> | string
    createdAt?: DateTimeFilter<"UserProgress"> | Date | string
    updatedAt?: DateTimeFilter<"UserProgress"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    lesson?: XOR<LessonRelationFilter, LessonWhereInput>
  }

  export type UserProgressOrderByWithRelationInput = {
    id?: SortOrder
    isCompleted?: SortOrder
    userId?: SortOrder
    lessonId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    lesson?: LessonOrderByWithRelationInput
  }

  export type UserProgressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_lessonId?: UserProgressUserIdLessonIdCompoundUniqueInput
    AND?: UserProgressWhereInput | UserProgressWhereInput[]
    OR?: UserProgressWhereInput[]
    NOT?: UserProgressWhereInput | UserProgressWhereInput[]
    isCompleted?: BoolFilter<"UserProgress"> | boolean
    userId?: StringFilter<"UserProgress"> | string
    lessonId?: StringFilter<"UserProgress"> | string
    createdAt?: DateTimeFilter<"UserProgress"> | Date | string
    updatedAt?: DateTimeFilter<"UserProgress"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    lesson?: XOR<LessonRelationFilter, LessonWhereInput>
  }, "id" | "userId_lessonId">

  export type UserProgressOrderByWithAggregationInput = {
    id?: SortOrder
    isCompleted?: SortOrder
    userId?: SortOrder
    lessonId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserProgressCountOrderByAggregateInput
    _max?: UserProgressMaxOrderByAggregateInput
    _min?: UserProgressMinOrderByAggregateInput
  }

  export type UserProgressScalarWhereWithAggregatesInput = {
    AND?: UserProgressScalarWhereWithAggregatesInput | UserProgressScalarWhereWithAggregatesInput[]
    OR?: UserProgressScalarWhereWithAggregatesInput[]
    NOT?: UserProgressScalarWhereWithAggregatesInput | UserProgressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserProgress"> | string
    isCompleted?: BoolWithAggregatesFilter<"UserProgress"> | boolean
    userId?: StringWithAggregatesFilter<"UserProgress"> | string
    lessonId?: StringWithAggregatesFilter<"UserProgress"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserProgress"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserProgress"> | Date | string
  }

  export type DeletionInfoWhereInput = {
    AND?: DeletionInfoWhereInput | DeletionInfoWhereInput[]
    OR?: DeletionInfoWhereInput[]
    NOT?: DeletionInfoWhereInput | DeletionInfoWhereInput[]
    id?: StringFilter<"DeletionInfo"> | string
    status?: EnumDeletionStatusFilter<"DeletionInfo"> | $Enums.DeletionStatus
    token?: StringNullableFilter<"DeletionInfo"> | string | null
    expiry?: DateTimeNullableFilter<"DeletionInfo"> | Date | string | null
    after?: DateTimeNullableFilter<"DeletionInfo"> | Date | string | null
    userId?: StringFilter<"DeletionInfo"> | string
    createdAt?: DateTimeFilter<"DeletionInfo"> | Date | string
    updatedAt?: DateTimeFilter<"DeletionInfo"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type DeletionInfoOrderByWithRelationInput = {
    id?: SortOrder
    status?: SortOrder
    token?: SortOrderInput | SortOrder
    expiry?: SortOrderInput | SortOrder
    after?: SortOrderInput | SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type DeletionInfoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    userId?: string
    AND?: DeletionInfoWhereInput | DeletionInfoWhereInput[]
    OR?: DeletionInfoWhereInput[]
    NOT?: DeletionInfoWhereInput | DeletionInfoWhereInput[]
    status?: EnumDeletionStatusFilter<"DeletionInfo"> | $Enums.DeletionStatus
    expiry?: DateTimeNullableFilter<"DeletionInfo"> | Date | string | null
    after?: DateTimeNullableFilter<"DeletionInfo"> | Date | string | null
    createdAt?: DateTimeFilter<"DeletionInfo"> | Date | string
    updatedAt?: DateTimeFilter<"DeletionInfo"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "token" | "userId">

  export type DeletionInfoOrderByWithAggregationInput = {
    id?: SortOrder
    status?: SortOrder
    token?: SortOrderInput | SortOrder
    expiry?: SortOrderInput | SortOrder
    after?: SortOrderInput | SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DeletionInfoCountOrderByAggregateInput
    _max?: DeletionInfoMaxOrderByAggregateInput
    _min?: DeletionInfoMinOrderByAggregateInput
  }

  export type DeletionInfoScalarWhereWithAggregatesInput = {
    AND?: DeletionInfoScalarWhereWithAggregatesInput | DeletionInfoScalarWhereWithAggregatesInput[]
    OR?: DeletionInfoScalarWhereWithAggregatesInput[]
    NOT?: DeletionInfoScalarWhereWithAggregatesInput | DeletionInfoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeletionInfo"> | string
    status?: EnumDeletionStatusWithAggregatesFilter<"DeletionInfo"> | $Enums.DeletionStatus
    token?: StringNullableWithAggregatesFilter<"DeletionInfo"> | string | null
    expiry?: DateTimeNullableWithAggregatesFilter<"DeletionInfo"> | Date | string | null
    after?: DateTimeNullableWithAggregatesFilter<"DeletionInfo"> | Date | string | null
    userId?: StringWithAggregatesFilter<"DeletionInfo"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DeletionInfo"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DeletionInfo"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressCreateNestedManyWithoutUserInput
    passwordReset?: PasswordResetCreateNestedOneWithoutUserInput
    mfa?: MultiFactorAuthenticationCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressUncheckedCreateNestedManyWithoutUserInput
    passwordReset?: PasswordResetUncheckedCreateNestedOneWithoutUserInput
    mfa?: MultiFactorAuthenticationUncheckedCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUpdateManyWithoutUserNestedInput
    passwordReset?: PasswordResetUpdateOneWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUncheckedUpdateManyWithoutUserNestedInput
    passwordReset?: PasswordResetUncheckedUpdateOneWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUncheckedUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetCreateInput = {
    id?: string
    token: string
    expiry: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutPasswordResetInput
  }

  export type PasswordResetUncheckedCreateInput = {
    id?: string
    token: string
    expiry: Date | string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPasswordResetNestedInput
  }

  export type PasswordResetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiry?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetCreateManyInput = {
    id?: string
    token: string
    expiry: Date | string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiry?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MultiFactorAuthenticationCreateInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    totp?: TotpCreateNestedOneWithoutMfaInput
    passkey?: PasskeyCreateNestedOneWithoutMfaInput
    user: UserCreateNestedOneWithoutMfaInput
  }

  export type MultiFactorAuthenticationUncheckedCreateInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    totpId?: string | null
    passkeyId?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MultiFactorAuthenticationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    totp?: TotpUpdateOneWithoutMfaNestedInput
    passkey?: PasskeyUpdateOneWithoutMfaNestedInput
    user?: UserUpdateOneRequiredWithoutMfaNestedInput
  }

  export type MultiFactorAuthenticationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    totpId?: NullableStringFieldUpdateOperationsInput | string | null
    passkeyId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MultiFactorAuthenticationCreateManyInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    totpId?: string | null
    passkeyId?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MultiFactorAuthenticationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MultiFactorAuthenticationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    totpId?: NullableStringFieldUpdateOperationsInput | string | null
    passkeyId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasskeyCreateInput = {
    id?: string
    publicKey: string
    privateKey: string
    isActivated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfa?: MultiFactorAuthenticationCreateNestedOneWithoutPasskeyInput
  }

  export type PasskeyUncheckedCreateInput = {
    id?: string
    publicKey: string
    privateKey: string
    isActivated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfa?: MultiFactorAuthenticationUncheckedCreateNestedOneWithoutPasskeyInput
  }

  export type PasskeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicKey?: StringFieldUpdateOperationsInput | string
    privateKey?: StringFieldUpdateOperationsInput | string
    isActivated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa?: MultiFactorAuthenticationUpdateOneWithoutPasskeyNestedInput
  }

  export type PasskeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicKey?: StringFieldUpdateOperationsInput | string
    privateKey?: StringFieldUpdateOperationsInput | string
    isActivated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa?: MultiFactorAuthenticationUncheckedUpdateOneWithoutPasskeyNestedInput
  }

  export type PasskeyCreateManyInput = {
    id?: string
    publicKey: string
    privateKey: string
    isActivated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasskeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicKey?: StringFieldUpdateOperationsInput | string
    privateKey?: StringFieldUpdateOperationsInput | string
    isActivated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasskeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicKey?: StringFieldUpdateOperationsInput | string
    privateKey?: StringFieldUpdateOperationsInput | string
    isActivated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TotpCreateInput = {
    id?: string
    status?: $Enums.TotpStatus
    secret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    mfa?: MultiFactorAuthenticationCreateNestedOneWithoutTotpInput
  }

  export type TotpUncheckedCreateInput = {
    id?: string
    status?: $Enums.TotpStatus
    secret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    mfa?: MultiFactorAuthenticationUncheckedCreateNestedOneWithoutTotpInput
  }

  export type TotpUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumTotpStatusFieldUpdateOperationsInput | $Enums.TotpStatus
    secret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa?: MultiFactorAuthenticationUpdateOneWithoutTotpNestedInput
  }

  export type TotpUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumTotpStatusFieldUpdateOperationsInput | $Enums.TotpStatus
    secret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfa?: MultiFactorAuthenticationUncheckedUpdateOneWithoutTotpNestedInput
  }

  export type TotpCreateManyInput = {
    id?: string
    status?: $Enums.TotpStatus
    secret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TotpUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumTotpStatusFieldUpdateOperationsInput | $Enums.TotpStatus
    secret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TotpUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumTotpStatusFieldUpdateOperationsInput | $Enums.TotpStatus
    secret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseCreateInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    thumbnail?: string | null
    youtubeUrl?: string | null
    codeUrl?: string | null
    isPublished?: boolean
    views?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    lessons?: LessonCreateNestedManyWithoutCourseInput
  }

  export type CourseUncheckedCreateInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    thumbnail?: string | null
    youtubeUrl?: string | null
    codeUrl?: string | null
    isPublished?: boolean
    views?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    lessons?: LessonUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    youtubeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    codeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    views?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lessons?: LessonUpdateManyWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    youtubeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    codeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    views?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lessons?: LessonUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseCreateManyInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    thumbnail?: string | null
    youtubeUrl?: string | null
    codeUrl?: string | null
    isPublished?: boolean
    views?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    youtubeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    codeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    views?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    youtubeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    codeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    views?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LessonCreateInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressCreateNestedManyWithoutLessonInput
    course: CourseCreateNestedOneWithoutLessonsInput
  }

  export type LessonUncheckedCreateInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    courseId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressUncheckedCreateNestedManyWithoutLessonInput
  }

  export type LessonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUpdateManyWithoutLessonNestedInput
    course?: CourseUpdateOneRequiredWithoutLessonsNestedInput
  }

  export type LessonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    courseId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUncheckedUpdateManyWithoutLessonNestedInput
  }

  export type LessonCreateManyInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    courseId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LessonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LessonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    courseId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressCreateInput = {
    id?: string
    isCompleted?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutUserProgressInput
    lesson: LessonCreateNestedOneWithoutUserProgressInput
  }

  export type UserProgressUncheckedCreateInput = {
    id?: string
    isCompleted?: boolean
    userId: string
    lessonId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProgressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutUserProgressNestedInput
    lesson?: LessonUpdateOneRequiredWithoutUserProgressNestedInput
  }

  export type UserProgressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    userId?: StringFieldUpdateOperationsInput | string
    lessonId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressCreateManyInput = {
    id?: string
    isCompleted?: boolean
    userId: string
    lessonId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProgressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    userId?: StringFieldUpdateOperationsInput | string
    lessonId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeletionInfoCreateInput = {
    id?: string
    status?: $Enums.DeletionStatus
    token?: string | null
    expiry?: Date | string | null
    after?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutDeletionInfoInput
  }

  export type DeletionInfoUncheckedCreateInput = {
    id?: string
    status?: $Enums.DeletionStatus
    token?: string | null
    expiry?: Date | string | null
    after?: Date | string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeletionInfoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumDeletionStatusFieldUpdateOperationsInput | $Enums.DeletionStatus
    token?: NullableStringFieldUpdateOperationsInput | string | null
    expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    after?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutDeletionInfoNestedInput
  }

  export type DeletionInfoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumDeletionStatusFieldUpdateOperationsInput | $Enums.DeletionStatus
    token?: NullableStringFieldUpdateOperationsInput | string | null
    expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    after?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeletionInfoCreateManyInput = {
    id?: string
    status?: $Enums.DeletionStatus
    token?: string | null
    expiry?: Date | string | null
    after?: Date | string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeletionInfoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumDeletionStatusFieldUpdateOperationsInput | $Enums.DeletionStatus
    token?: NullableStringFieldUpdateOperationsInput | string | null
    expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    after?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeletionInfoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumDeletionStatusFieldUpdateOperationsInput | $Enums.DeletionStatus
    token?: NullableStringFieldUpdateOperationsInput | string | null
    expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    after?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserProgressListRelationFilter = {
    every?: UserProgressWhereInput
    some?: UserProgressWhereInput
    none?: UserProgressWhereInput
  }

  export type PasswordResetNullableRelationFilter = {
    is?: PasswordResetWhereInput | null
    isNot?: PasswordResetWhereInput | null
  }

  export type MultiFactorAuthenticationNullableRelationFilter = {
    is?: MultiFactorAuthenticationWhereInput | null
    isNot?: MultiFactorAuthenticationWhereInput | null
  }

  export type DeletionInfoNullableRelationFilter = {
    is?: DeletionInfoWhereInput | null
    isNot?: DeletionInfoWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserProgressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    avatar?: SortOrder
    points?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    points?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    avatar?: SortOrder
    points?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    avatar?: SortOrder
    points?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    points?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PasswordResetCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasswordResetMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasswordResetMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type TotpNullableRelationFilter = {
    is?: TotpWhereInput | null
    isNot?: TotpWhereInput | null
  }

  export type PasskeyNullableRelationFilter = {
    is?: PasskeyWhereInput | null
    isNot?: PasskeyWhereInput | null
  }

  export type MultiFactorAuthenticationCountOrderByAggregateInput = {
    id?: SortOrder
    recoveryCodes?: SortOrder
    totpId?: SortOrder
    passkeyId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MultiFactorAuthenticationMaxOrderByAggregateInput = {
    id?: SortOrder
    totpId?: SortOrder
    passkeyId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MultiFactorAuthenticationMinOrderByAggregateInput = {
    id?: SortOrder
    totpId?: SortOrder
    passkeyId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type PasskeyCountOrderByAggregateInput = {
    id?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    isActivated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasskeyMaxOrderByAggregateInput = {
    id?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    isActivated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PasskeyMinOrderByAggregateInput = {
    id?: SortOrder
    publicKey?: SortOrder
    privateKey?: SortOrder
    isActivated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumTotpStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TotpStatus | EnumTotpStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTotpStatusFilter<$PrismaModel> | $Enums.TotpStatus
  }

  export type TotpCountOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TotpMaxOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TotpMinOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    secret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumTotpStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TotpStatus | EnumTotpStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTotpStatusWithAggregatesFilter<$PrismaModel> | $Enums.TotpStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTotpStatusFilter<$PrismaModel>
    _max?: NestedEnumTotpStatusFilter<$PrismaModel>
  }

  export type LessonListRelationFilter = {
    every?: LessonWhereInput
    some?: LessonWhereInput
    none?: LessonWhereInput
  }

  export type LessonOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CourseCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    thumbnail?: SortOrder
    youtubeUrl?: SortOrder
    codeUrl?: SortOrder
    isPublished?: SortOrder
    views?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourseAvgOrderByAggregateInput = {
    views?: SortOrder
  }

  export type CourseMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    thumbnail?: SortOrder
    youtubeUrl?: SortOrder
    codeUrl?: SortOrder
    isPublished?: SortOrder
    views?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourseMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    thumbnail?: SortOrder
    youtubeUrl?: SortOrder
    codeUrl?: SortOrder
    isPublished?: SortOrder
    views?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourseSumOrderByAggregateInput = {
    views?: SortOrder
  }

  export type CourseRelationFilter = {
    is?: CourseWhereInput
    isNot?: CourseWhereInput
  }

  export type LessonCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    position?: SortOrder
    kinescopeId?: SortOrder
    isPublished?: SortOrder
    courseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LessonAvgOrderByAggregateInput = {
    position?: SortOrder
  }

  export type LessonMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    position?: SortOrder
    kinescopeId?: SortOrder
    isPublished?: SortOrder
    courseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LessonMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    position?: SortOrder
    kinescopeId?: SortOrder
    isPublished?: SortOrder
    courseId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LessonSumOrderByAggregateInput = {
    position?: SortOrder
  }

  export type LessonRelationFilter = {
    is?: LessonWhereInput
    isNot?: LessonWhereInput
  }

  export type UserProgressUserIdLessonIdCompoundUniqueInput = {
    userId: string
    lessonId: string
  }

  export type UserProgressCountOrderByAggregateInput = {
    id?: SortOrder
    isCompleted?: SortOrder
    userId?: SortOrder
    lessonId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProgressMaxOrderByAggregateInput = {
    id?: SortOrder
    isCompleted?: SortOrder
    userId?: SortOrder
    lessonId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProgressMinOrderByAggregateInput = {
    id?: SortOrder
    isCompleted?: SortOrder
    userId?: SortOrder
    lessonId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumDeletionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DeletionStatus | EnumDeletionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeletionStatusFilter<$PrismaModel> | $Enums.DeletionStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DeletionInfoCountOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    after?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DeletionInfoMaxOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    after?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DeletionInfoMinOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    token?: SortOrder
    expiry?: SortOrder
    after?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumDeletionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeletionStatus | EnumDeletionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeletionStatusWithAggregatesFilter<$PrismaModel> | $Enums.DeletionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeletionStatusFilter<$PrismaModel>
    _max?: NestedEnumDeletionStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserProgressCreateNestedManyWithoutUserInput = {
    create?: XOR<UserProgressCreateWithoutUserInput, UserProgressUncheckedCreateWithoutUserInput> | UserProgressCreateWithoutUserInput[] | UserProgressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutUserInput | UserProgressCreateOrConnectWithoutUserInput[]
    createMany?: UserProgressCreateManyUserInputEnvelope
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
  }

  export type PasswordResetCreateNestedOneWithoutUserInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput
    connect?: PasswordResetWhereUniqueInput
  }

  export type MultiFactorAuthenticationCreateNestedOneWithoutUserInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutUserInput, MultiFactorAuthenticationUncheckedCreateWithoutUserInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutUserInput
    connect?: MultiFactorAuthenticationWhereUniqueInput
  }

  export type DeletionInfoCreateNestedOneWithoutUserInput = {
    create?: XOR<DeletionInfoCreateWithoutUserInput, DeletionInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: DeletionInfoCreateOrConnectWithoutUserInput
    connect?: DeletionInfoWhereUniqueInput
  }

  export type UserProgressUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserProgressCreateWithoutUserInput, UserProgressUncheckedCreateWithoutUserInput> | UserProgressCreateWithoutUserInput[] | UserProgressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutUserInput | UserProgressCreateOrConnectWithoutUserInput[]
    createMany?: UserProgressCreateManyUserInputEnvelope
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
  }

  export type PasswordResetUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput
    connect?: PasswordResetWhereUniqueInput
  }

  export type MultiFactorAuthenticationUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutUserInput, MultiFactorAuthenticationUncheckedCreateWithoutUserInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutUserInput
    connect?: MultiFactorAuthenticationWhereUniqueInput
  }

  export type DeletionInfoUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<DeletionInfoCreateWithoutUserInput, DeletionInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: DeletionInfoCreateOrConnectWithoutUserInput
    connect?: DeletionInfoWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserProgressUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserProgressCreateWithoutUserInput, UserProgressUncheckedCreateWithoutUserInput> | UserProgressCreateWithoutUserInput[] | UserProgressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutUserInput | UserProgressCreateOrConnectWithoutUserInput[]
    upsert?: UserProgressUpsertWithWhereUniqueWithoutUserInput | UserProgressUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserProgressCreateManyUserInputEnvelope
    set?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    disconnect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    delete?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    update?: UserProgressUpdateWithWhereUniqueWithoutUserInput | UserProgressUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserProgressUpdateManyWithWhereWithoutUserInput | UserProgressUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
  }

  export type PasswordResetUpdateOneWithoutUserNestedInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput
    upsert?: PasswordResetUpsertWithoutUserInput
    disconnect?: PasswordResetWhereInput | boolean
    delete?: PasswordResetWhereInput | boolean
    connect?: PasswordResetWhereUniqueInput
    update?: XOR<XOR<PasswordResetUpdateToOneWithWhereWithoutUserInput, PasswordResetUpdateWithoutUserInput>, PasswordResetUncheckedUpdateWithoutUserInput>
  }

  export type MultiFactorAuthenticationUpdateOneWithoutUserNestedInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutUserInput, MultiFactorAuthenticationUncheckedCreateWithoutUserInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutUserInput
    upsert?: MultiFactorAuthenticationUpsertWithoutUserInput
    disconnect?: MultiFactorAuthenticationWhereInput | boolean
    delete?: MultiFactorAuthenticationWhereInput | boolean
    connect?: MultiFactorAuthenticationWhereUniqueInput
    update?: XOR<XOR<MultiFactorAuthenticationUpdateToOneWithWhereWithoutUserInput, MultiFactorAuthenticationUpdateWithoutUserInput>, MultiFactorAuthenticationUncheckedUpdateWithoutUserInput>
  }

  export type DeletionInfoUpdateOneWithoutUserNestedInput = {
    create?: XOR<DeletionInfoCreateWithoutUserInput, DeletionInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: DeletionInfoCreateOrConnectWithoutUserInput
    upsert?: DeletionInfoUpsertWithoutUserInput
    disconnect?: DeletionInfoWhereInput | boolean
    delete?: DeletionInfoWhereInput | boolean
    connect?: DeletionInfoWhereUniqueInput
    update?: XOR<XOR<DeletionInfoUpdateToOneWithWhereWithoutUserInput, DeletionInfoUpdateWithoutUserInput>, DeletionInfoUncheckedUpdateWithoutUserInput>
  }

  export type UserProgressUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserProgressCreateWithoutUserInput, UserProgressUncheckedCreateWithoutUserInput> | UserProgressCreateWithoutUserInput[] | UserProgressUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutUserInput | UserProgressCreateOrConnectWithoutUserInput[]
    upsert?: UserProgressUpsertWithWhereUniqueWithoutUserInput | UserProgressUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserProgressCreateManyUserInputEnvelope
    set?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    disconnect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    delete?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    update?: UserProgressUpdateWithWhereUniqueWithoutUserInput | UserProgressUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserProgressUpdateManyWithWhereWithoutUserInput | UserProgressUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
  }

  export type PasswordResetUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput
    upsert?: PasswordResetUpsertWithoutUserInput
    disconnect?: PasswordResetWhereInput | boolean
    delete?: PasswordResetWhereInput | boolean
    connect?: PasswordResetWhereUniqueInput
    update?: XOR<XOR<PasswordResetUpdateToOneWithWhereWithoutUserInput, PasswordResetUpdateWithoutUserInput>, PasswordResetUncheckedUpdateWithoutUserInput>
  }

  export type MultiFactorAuthenticationUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutUserInput, MultiFactorAuthenticationUncheckedCreateWithoutUserInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutUserInput
    upsert?: MultiFactorAuthenticationUpsertWithoutUserInput
    disconnect?: MultiFactorAuthenticationWhereInput | boolean
    delete?: MultiFactorAuthenticationWhereInput | boolean
    connect?: MultiFactorAuthenticationWhereUniqueInput
    update?: XOR<XOR<MultiFactorAuthenticationUpdateToOneWithWhereWithoutUserInput, MultiFactorAuthenticationUpdateWithoutUserInput>, MultiFactorAuthenticationUncheckedUpdateWithoutUserInput>
  }

  export type DeletionInfoUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<DeletionInfoCreateWithoutUserInput, DeletionInfoUncheckedCreateWithoutUserInput>
    connectOrCreate?: DeletionInfoCreateOrConnectWithoutUserInput
    upsert?: DeletionInfoUpsertWithoutUserInput
    disconnect?: DeletionInfoWhereInput | boolean
    delete?: DeletionInfoWhereInput | boolean
    connect?: DeletionInfoWhereUniqueInput
    update?: XOR<XOR<DeletionInfoUpdateToOneWithWhereWithoutUserInput, DeletionInfoUpdateWithoutUserInput>, DeletionInfoUncheckedUpdateWithoutUserInput>
  }

  export type UserCreateNestedOneWithoutPasswordResetInput = {
    create?: XOR<UserCreateWithoutPasswordResetInput, UserUncheckedCreateWithoutPasswordResetInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutPasswordResetNestedInput = {
    create?: XOR<UserCreateWithoutPasswordResetInput, UserUncheckedCreateWithoutPasswordResetInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetInput
    upsert?: UserUpsertWithoutPasswordResetInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPasswordResetInput, UserUpdateWithoutPasswordResetInput>, UserUncheckedUpdateWithoutPasswordResetInput>
  }

  export type MultiFactorAuthenticationCreaterecoveryCodesInput = {
    set: string[]
  }

  export type TotpCreateNestedOneWithoutMfaInput = {
    create?: XOR<TotpCreateWithoutMfaInput, TotpUncheckedCreateWithoutMfaInput>
    connectOrCreate?: TotpCreateOrConnectWithoutMfaInput
    connect?: TotpWhereUniqueInput
  }

  export type PasskeyCreateNestedOneWithoutMfaInput = {
    create?: XOR<PasskeyCreateWithoutMfaInput, PasskeyUncheckedCreateWithoutMfaInput>
    connectOrCreate?: PasskeyCreateOrConnectWithoutMfaInput
    connect?: PasskeyWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMfaInput = {
    create?: XOR<UserCreateWithoutMfaInput, UserUncheckedCreateWithoutMfaInput>
    connectOrCreate?: UserCreateOrConnectWithoutMfaInput
    connect?: UserWhereUniqueInput
  }

  export type MultiFactorAuthenticationUpdaterecoveryCodesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TotpUpdateOneWithoutMfaNestedInput = {
    create?: XOR<TotpCreateWithoutMfaInput, TotpUncheckedCreateWithoutMfaInput>
    connectOrCreate?: TotpCreateOrConnectWithoutMfaInput
    upsert?: TotpUpsertWithoutMfaInput
    disconnect?: TotpWhereInput | boolean
    delete?: TotpWhereInput | boolean
    connect?: TotpWhereUniqueInput
    update?: XOR<XOR<TotpUpdateToOneWithWhereWithoutMfaInput, TotpUpdateWithoutMfaInput>, TotpUncheckedUpdateWithoutMfaInput>
  }

  export type PasskeyUpdateOneWithoutMfaNestedInput = {
    create?: XOR<PasskeyCreateWithoutMfaInput, PasskeyUncheckedCreateWithoutMfaInput>
    connectOrCreate?: PasskeyCreateOrConnectWithoutMfaInput
    upsert?: PasskeyUpsertWithoutMfaInput
    disconnect?: PasskeyWhereInput | boolean
    delete?: PasskeyWhereInput | boolean
    connect?: PasskeyWhereUniqueInput
    update?: XOR<XOR<PasskeyUpdateToOneWithWhereWithoutMfaInput, PasskeyUpdateWithoutMfaInput>, PasskeyUncheckedUpdateWithoutMfaInput>
  }

  export type UserUpdateOneRequiredWithoutMfaNestedInput = {
    create?: XOR<UserCreateWithoutMfaInput, UserUncheckedCreateWithoutMfaInput>
    connectOrCreate?: UserCreateOrConnectWithoutMfaInput
    upsert?: UserUpsertWithoutMfaInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMfaInput, UserUpdateWithoutMfaInput>, UserUncheckedUpdateWithoutMfaInput>
  }

  export type MultiFactorAuthenticationCreateNestedOneWithoutPasskeyInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutPasskeyInput
    connect?: MultiFactorAuthenticationWhereUniqueInput
  }

  export type MultiFactorAuthenticationUncheckedCreateNestedOneWithoutPasskeyInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutPasskeyInput
    connect?: MultiFactorAuthenticationWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type MultiFactorAuthenticationUpdateOneWithoutPasskeyNestedInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutPasskeyInput
    upsert?: MultiFactorAuthenticationUpsertWithoutPasskeyInput
    disconnect?: MultiFactorAuthenticationWhereInput | boolean
    delete?: MultiFactorAuthenticationWhereInput | boolean
    connect?: MultiFactorAuthenticationWhereUniqueInput
    update?: XOR<XOR<MultiFactorAuthenticationUpdateToOneWithWhereWithoutPasskeyInput, MultiFactorAuthenticationUpdateWithoutPasskeyInput>, MultiFactorAuthenticationUncheckedUpdateWithoutPasskeyInput>
  }

  export type MultiFactorAuthenticationUncheckedUpdateOneWithoutPasskeyNestedInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutPasskeyInput
    upsert?: MultiFactorAuthenticationUpsertWithoutPasskeyInput
    disconnect?: MultiFactorAuthenticationWhereInput | boolean
    delete?: MultiFactorAuthenticationWhereInput | boolean
    connect?: MultiFactorAuthenticationWhereUniqueInput
    update?: XOR<XOR<MultiFactorAuthenticationUpdateToOneWithWhereWithoutPasskeyInput, MultiFactorAuthenticationUpdateWithoutPasskeyInput>, MultiFactorAuthenticationUncheckedUpdateWithoutPasskeyInput>
  }

  export type MultiFactorAuthenticationCreateNestedOneWithoutTotpInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutTotpInput, MultiFactorAuthenticationUncheckedCreateWithoutTotpInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutTotpInput
    connect?: MultiFactorAuthenticationWhereUniqueInput
  }

  export type MultiFactorAuthenticationUncheckedCreateNestedOneWithoutTotpInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutTotpInput, MultiFactorAuthenticationUncheckedCreateWithoutTotpInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutTotpInput
    connect?: MultiFactorAuthenticationWhereUniqueInput
  }

  export type EnumTotpStatusFieldUpdateOperationsInput = {
    set?: $Enums.TotpStatus
  }

  export type MultiFactorAuthenticationUpdateOneWithoutTotpNestedInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutTotpInput, MultiFactorAuthenticationUncheckedCreateWithoutTotpInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutTotpInput
    upsert?: MultiFactorAuthenticationUpsertWithoutTotpInput
    disconnect?: MultiFactorAuthenticationWhereInput | boolean
    delete?: MultiFactorAuthenticationWhereInput | boolean
    connect?: MultiFactorAuthenticationWhereUniqueInput
    update?: XOR<XOR<MultiFactorAuthenticationUpdateToOneWithWhereWithoutTotpInput, MultiFactorAuthenticationUpdateWithoutTotpInput>, MultiFactorAuthenticationUncheckedUpdateWithoutTotpInput>
  }

  export type MultiFactorAuthenticationUncheckedUpdateOneWithoutTotpNestedInput = {
    create?: XOR<MultiFactorAuthenticationCreateWithoutTotpInput, MultiFactorAuthenticationUncheckedCreateWithoutTotpInput>
    connectOrCreate?: MultiFactorAuthenticationCreateOrConnectWithoutTotpInput
    upsert?: MultiFactorAuthenticationUpsertWithoutTotpInput
    disconnect?: MultiFactorAuthenticationWhereInput | boolean
    delete?: MultiFactorAuthenticationWhereInput | boolean
    connect?: MultiFactorAuthenticationWhereUniqueInput
    update?: XOR<XOR<MultiFactorAuthenticationUpdateToOneWithWhereWithoutTotpInput, MultiFactorAuthenticationUpdateWithoutTotpInput>, MultiFactorAuthenticationUncheckedUpdateWithoutTotpInput>
  }

  export type LessonCreateNestedManyWithoutCourseInput = {
    create?: XOR<LessonCreateWithoutCourseInput, LessonUncheckedCreateWithoutCourseInput> | LessonCreateWithoutCourseInput[] | LessonUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: LessonCreateOrConnectWithoutCourseInput | LessonCreateOrConnectWithoutCourseInput[]
    createMany?: LessonCreateManyCourseInputEnvelope
    connect?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
  }

  export type LessonUncheckedCreateNestedManyWithoutCourseInput = {
    create?: XOR<LessonCreateWithoutCourseInput, LessonUncheckedCreateWithoutCourseInput> | LessonCreateWithoutCourseInput[] | LessonUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: LessonCreateOrConnectWithoutCourseInput | LessonCreateOrConnectWithoutCourseInput[]
    createMany?: LessonCreateManyCourseInputEnvelope
    connect?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
  }

  export type LessonUpdateManyWithoutCourseNestedInput = {
    create?: XOR<LessonCreateWithoutCourseInput, LessonUncheckedCreateWithoutCourseInput> | LessonCreateWithoutCourseInput[] | LessonUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: LessonCreateOrConnectWithoutCourseInput | LessonCreateOrConnectWithoutCourseInput[]
    upsert?: LessonUpsertWithWhereUniqueWithoutCourseInput | LessonUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: LessonCreateManyCourseInputEnvelope
    set?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    disconnect?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    delete?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    connect?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    update?: LessonUpdateWithWhereUniqueWithoutCourseInput | LessonUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: LessonUpdateManyWithWhereWithoutCourseInput | LessonUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: LessonScalarWhereInput | LessonScalarWhereInput[]
  }

  export type LessonUncheckedUpdateManyWithoutCourseNestedInput = {
    create?: XOR<LessonCreateWithoutCourseInput, LessonUncheckedCreateWithoutCourseInput> | LessonCreateWithoutCourseInput[] | LessonUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: LessonCreateOrConnectWithoutCourseInput | LessonCreateOrConnectWithoutCourseInput[]
    upsert?: LessonUpsertWithWhereUniqueWithoutCourseInput | LessonUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: LessonCreateManyCourseInputEnvelope
    set?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    disconnect?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    delete?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    connect?: LessonWhereUniqueInput | LessonWhereUniqueInput[]
    update?: LessonUpdateWithWhereUniqueWithoutCourseInput | LessonUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: LessonUpdateManyWithWhereWithoutCourseInput | LessonUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: LessonScalarWhereInput | LessonScalarWhereInput[]
  }

  export type UserProgressCreateNestedManyWithoutLessonInput = {
    create?: XOR<UserProgressCreateWithoutLessonInput, UserProgressUncheckedCreateWithoutLessonInput> | UserProgressCreateWithoutLessonInput[] | UserProgressUncheckedCreateWithoutLessonInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutLessonInput | UserProgressCreateOrConnectWithoutLessonInput[]
    createMany?: UserProgressCreateManyLessonInputEnvelope
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
  }

  export type CourseCreateNestedOneWithoutLessonsInput = {
    create?: XOR<CourseCreateWithoutLessonsInput, CourseUncheckedCreateWithoutLessonsInput>
    connectOrCreate?: CourseCreateOrConnectWithoutLessonsInput
    connect?: CourseWhereUniqueInput
  }

  export type UserProgressUncheckedCreateNestedManyWithoutLessonInput = {
    create?: XOR<UserProgressCreateWithoutLessonInput, UserProgressUncheckedCreateWithoutLessonInput> | UserProgressCreateWithoutLessonInput[] | UserProgressUncheckedCreateWithoutLessonInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutLessonInput | UserProgressCreateOrConnectWithoutLessonInput[]
    createMany?: UserProgressCreateManyLessonInputEnvelope
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
  }

  export type UserProgressUpdateManyWithoutLessonNestedInput = {
    create?: XOR<UserProgressCreateWithoutLessonInput, UserProgressUncheckedCreateWithoutLessonInput> | UserProgressCreateWithoutLessonInput[] | UserProgressUncheckedCreateWithoutLessonInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutLessonInput | UserProgressCreateOrConnectWithoutLessonInput[]
    upsert?: UserProgressUpsertWithWhereUniqueWithoutLessonInput | UserProgressUpsertWithWhereUniqueWithoutLessonInput[]
    createMany?: UserProgressCreateManyLessonInputEnvelope
    set?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    disconnect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    delete?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    update?: UserProgressUpdateWithWhereUniqueWithoutLessonInput | UserProgressUpdateWithWhereUniqueWithoutLessonInput[]
    updateMany?: UserProgressUpdateManyWithWhereWithoutLessonInput | UserProgressUpdateManyWithWhereWithoutLessonInput[]
    deleteMany?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
  }

  export type CourseUpdateOneRequiredWithoutLessonsNestedInput = {
    create?: XOR<CourseCreateWithoutLessonsInput, CourseUncheckedCreateWithoutLessonsInput>
    connectOrCreate?: CourseCreateOrConnectWithoutLessonsInput
    upsert?: CourseUpsertWithoutLessonsInput
    connect?: CourseWhereUniqueInput
    update?: XOR<XOR<CourseUpdateToOneWithWhereWithoutLessonsInput, CourseUpdateWithoutLessonsInput>, CourseUncheckedUpdateWithoutLessonsInput>
  }

  export type UserProgressUncheckedUpdateManyWithoutLessonNestedInput = {
    create?: XOR<UserProgressCreateWithoutLessonInput, UserProgressUncheckedCreateWithoutLessonInput> | UserProgressCreateWithoutLessonInput[] | UserProgressUncheckedCreateWithoutLessonInput[]
    connectOrCreate?: UserProgressCreateOrConnectWithoutLessonInput | UserProgressCreateOrConnectWithoutLessonInput[]
    upsert?: UserProgressUpsertWithWhereUniqueWithoutLessonInput | UserProgressUpsertWithWhereUniqueWithoutLessonInput[]
    createMany?: UserProgressCreateManyLessonInputEnvelope
    set?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    disconnect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    delete?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    connect?: UserProgressWhereUniqueInput | UserProgressWhereUniqueInput[]
    update?: UserProgressUpdateWithWhereUniqueWithoutLessonInput | UserProgressUpdateWithWhereUniqueWithoutLessonInput[]
    updateMany?: UserProgressUpdateManyWithWhereWithoutLessonInput | UserProgressUpdateManyWithWhereWithoutLessonInput[]
    deleteMany?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutUserProgressInput = {
    create?: XOR<UserCreateWithoutUserProgressInput, UserUncheckedCreateWithoutUserProgressInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserProgressInput
    connect?: UserWhereUniqueInput
  }

  export type LessonCreateNestedOneWithoutUserProgressInput = {
    create?: XOR<LessonCreateWithoutUserProgressInput, LessonUncheckedCreateWithoutUserProgressInput>
    connectOrCreate?: LessonCreateOrConnectWithoutUserProgressInput
    connect?: LessonWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutUserProgressNestedInput = {
    create?: XOR<UserCreateWithoutUserProgressInput, UserUncheckedCreateWithoutUserProgressInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserProgressInput
    upsert?: UserUpsertWithoutUserProgressInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserProgressInput, UserUpdateWithoutUserProgressInput>, UserUncheckedUpdateWithoutUserProgressInput>
  }

  export type LessonUpdateOneRequiredWithoutUserProgressNestedInput = {
    create?: XOR<LessonCreateWithoutUserProgressInput, LessonUncheckedCreateWithoutUserProgressInput>
    connectOrCreate?: LessonCreateOrConnectWithoutUserProgressInput
    upsert?: LessonUpsertWithoutUserProgressInput
    connect?: LessonWhereUniqueInput
    update?: XOR<XOR<LessonUpdateToOneWithWhereWithoutUserProgressInput, LessonUpdateWithoutUserProgressInput>, LessonUncheckedUpdateWithoutUserProgressInput>
  }

  export type UserCreateNestedOneWithoutDeletionInfoInput = {
    create?: XOR<UserCreateWithoutDeletionInfoInput, UserUncheckedCreateWithoutDeletionInfoInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletionInfoInput
    connect?: UserWhereUniqueInput
  }

  export type EnumDeletionStatusFieldUpdateOperationsInput = {
    set?: $Enums.DeletionStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutDeletionInfoNestedInput = {
    create?: XOR<UserCreateWithoutDeletionInfoInput, UserUncheckedCreateWithoutDeletionInfoInput>
    connectOrCreate?: UserCreateOrConnectWithoutDeletionInfoInput
    upsert?: UserUpsertWithoutDeletionInfoInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDeletionInfoInput, UserUpdateWithoutDeletionInfoInput>, UserUncheckedUpdateWithoutDeletionInfoInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumTotpStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TotpStatus | EnumTotpStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTotpStatusFilter<$PrismaModel> | $Enums.TotpStatus
  }

  export type NestedEnumTotpStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TotpStatus | EnumTotpStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TotpStatus[] | ListEnumTotpStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTotpStatusWithAggregatesFilter<$PrismaModel> | $Enums.TotpStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTotpStatusFilter<$PrismaModel>
    _max?: NestedEnumTotpStatusFilter<$PrismaModel>
  }

  export type NestedEnumDeletionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DeletionStatus | EnumDeletionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeletionStatusFilter<$PrismaModel> | $Enums.DeletionStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumDeletionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeletionStatus | EnumDeletionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeletionStatus[] | ListEnumDeletionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeletionStatusWithAggregatesFilter<$PrismaModel> | $Enums.DeletionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeletionStatusFilter<$PrismaModel>
    _max?: NestedEnumDeletionStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserProgressCreateWithoutUserInput = {
    id?: string
    isCompleted?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lesson: LessonCreateNestedOneWithoutUserProgressInput
  }

  export type UserProgressUncheckedCreateWithoutUserInput = {
    id?: string
    isCompleted?: boolean
    lessonId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProgressCreateOrConnectWithoutUserInput = {
    where: UserProgressWhereUniqueInput
    create: XOR<UserProgressCreateWithoutUserInput, UserProgressUncheckedCreateWithoutUserInput>
  }

  export type UserProgressCreateManyUserInputEnvelope = {
    data: UserProgressCreateManyUserInput | UserProgressCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PasswordResetCreateWithoutUserInput = {
    id?: string
    token: string
    expiry: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetUncheckedCreateWithoutUserInput = {
    id?: string
    token: string
    expiry: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasswordResetCreateOrConnectWithoutUserInput = {
    where: PasswordResetWhereUniqueInput
    create: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
  }

  export type MultiFactorAuthenticationCreateWithoutUserInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    totp?: TotpCreateNestedOneWithoutMfaInput
    passkey?: PasskeyCreateNestedOneWithoutMfaInput
  }

  export type MultiFactorAuthenticationUncheckedCreateWithoutUserInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    totpId?: string | null
    passkeyId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MultiFactorAuthenticationCreateOrConnectWithoutUserInput = {
    where: MultiFactorAuthenticationWhereUniqueInput
    create: XOR<MultiFactorAuthenticationCreateWithoutUserInput, MultiFactorAuthenticationUncheckedCreateWithoutUserInput>
  }

  export type DeletionInfoCreateWithoutUserInput = {
    id?: string
    status?: $Enums.DeletionStatus
    token?: string | null
    expiry?: Date | string | null
    after?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeletionInfoUncheckedCreateWithoutUserInput = {
    id?: string
    status?: $Enums.DeletionStatus
    token?: string | null
    expiry?: Date | string | null
    after?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DeletionInfoCreateOrConnectWithoutUserInput = {
    where: DeletionInfoWhereUniqueInput
    create: XOR<DeletionInfoCreateWithoutUserInput, DeletionInfoUncheckedCreateWithoutUserInput>
  }

  export type UserProgressUpsertWithWhereUniqueWithoutUserInput = {
    where: UserProgressWhereUniqueInput
    update: XOR<UserProgressUpdateWithoutUserInput, UserProgressUncheckedUpdateWithoutUserInput>
    create: XOR<UserProgressCreateWithoutUserInput, UserProgressUncheckedCreateWithoutUserInput>
  }

  export type UserProgressUpdateWithWhereUniqueWithoutUserInput = {
    where: UserProgressWhereUniqueInput
    data: XOR<UserProgressUpdateWithoutUserInput, UserProgressUncheckedUpdateWithoutUserInput>
  }

  export type UserProgressUpdateManyWithWhereWithoutUserInput = {
    where: UserProgressScalarWhereInput
    data: XOR<UserProgressUpdateManyMutationInput, UserProgressUncheckedUpdateManyWithoutUserInput>
  }

  export type UserProgressScalarWhereInput = {
    AND?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
    OR?: UserProgressScalarWhereInput[]
    NOT?: UserProgressScalarWhereInput | UserProgressScalarWhereInput[]
    id?: StringFilter<"UserProgress"> | string
    isCompleted?: BoolFilter<"UserProgress"> | boolean
    userId?: StringFilter<"UserProgress"> | string
    lessonId?: StringFilter<"UserProgress"> | string
    createdAt?: DateTimeFilter<"UserProgress"> | Date | string
    updatedAt?: DateTimeFilter<"UserProgress"> | Date | string
  }

  export type PasswordResetUpsertWithoutUserInput = {
    update: XOR<PasswordResetUpdateWithoutUserInput, PasswordResetUncheckedUpdateWithoutUserInput>
    create: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
    where?: PasswordResetWhereInput
  }

  export type PasswordResetUpdateToOneWithWhereWithoutUserInput = {
    where?: PasswordResetWhereInput
    data: XOR<PasswordResetUpdateWithoutUserInput, PasswordResetUncheckedUpdateWithoutUserInput>
  }

  export type PasswordResetUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiry?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MultiFactorAuthenticationUpsertWithoutUserInput = {
    update: XOR<MultiFactorAuthenticationUpdateWithoutUserInput, MultiFactorAuthenticationUncheckedUpdateWithoutUserInput>
    create: XOR<MultiFactorAuthenticationCreateWithoutUserInput, MultiFactorAuthenticationUncheckedCreateWithoutUserInput>
    where?: MultiFactorAuthenticationWhereInput
  }

  export type MultiFactorAuthenticationUpdateToOneWithWhereWithoutUserInput = {
    where?: MultiFactorAuthenticationWhereInput
    data: XOR<MultiFactorAuthenticationUpdateWithoutUserInput, MultiFactorAuthenticationUncheckedUpdateWithoutUserInput>
  }

  export type MultiFactorAuthenticationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    totp?: TotpUpdateOneWithoutMfaNestedInput
    passkey?: PasskeyUpdateOneWithoutMfaNestedInput
  }

  export type MultiFactorAuthenticationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    totpId?: NullableStringFieldUpdateOperationsInput | string | null
    passkeyId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeletionInfoUpsertWithoutUserInput = {
    update: XOR<DeletionInfoUpdateWithoutUserInput, DeletionInfoUncheckedUpdateWithoutUserInput>
    create: XOR<DeletionInfoCreateWithoutUserInput, DeletionInfoUncheckedCreateWithoutUserInput>
    where?: DeletionInfoWhereInput
  }

  export type DeletionInfoUpdateToOneWithWhereWithoutUserInput = {
    where?: DeletionInfoWhereInput
    data: XOR<DeletionInfoUpdateWithoutUserInput, DeletionInfoUncheckedUpdateWithoutUserInput>
  }

  export type DeletionInfoUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumDeletionStatusFieldUpdateOperationsInput | $Enums.DeletionStatus
    token?: NullableStringFieldUpdateOperationsInput | string | null
    expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    after?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DeletionInfoUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumDeletionStatusFieldUpdateOperationsInput | $Enums.DeletionStatus
    token?: NullableStringFieldUpdateOperationsInput | string | null
    expiry?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    after?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutPasswordResetInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressCreateNestedManyWithoutUserInput
    mfa?: MultiFactorAuthenticationCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPasswordResetInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressUncheckedCreateNestedManyWithoutUserInput
    mfa?: MultiFactorAuthenticationUncheckedCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPasswordResetInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPasswordResetInput, UserUncheckedCreateWithoutPasswordResetInput>
  }

  export type UserUpsertWithoutPasswordResetInput = {
    update: XOR<UserUpdateWithoutPasswordResetInput, UserUncheckedUpdateWithoutPasswordResetInput>
    create: XOR<UserCreateWithoutPasswordResetInput, UserUncheckedCreateWithoutPasswordResetInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPasswordResetInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPasswordResetInput, UserUncheckedUpdateWithoutPasswordResetInput>
  }

  export type UserUpdateWithoutPasswordResetInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUpdateManyWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPasswordResetInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUncheckedUpdateManyWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUncheckedUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUncheckedUpdateOneWithoutUserNestedInput
  }

  export type TotpCreateWithoutMfaInput = {
    id?: string
    status?: $Enums.TotpStatus
    secret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TotpUncheckedCreateWithoutMfaInput = {
    id?: string
    status?: $Enums.TotpStatus
    secret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TotpCreateOrConnectWithoutMfaInput = {
    where: TotpWhereUniqueInput
    create: XOR<TotpCreateWithoutMfaInput, TotpUncheckedCreateWithoutMfaInput>
  }

  export type PasskeyCreateWithoutMfaInput = {
    id?: string
    publicKey: string
    privateKey: string
    isActivated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasskeyUncheckedCreateWithoutMfaInput = {
    id?: string
    publicKey: string
    privateKey: string
    isActivated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PasskeyCreateOrConnectWithoutMfaInput = {
    where: PasskeyWhereUniqueInput
    create: XOR<PasskeyCreateWithoutMfaInput, PasskeyUncheckedCreateWithoutMfaInput>
  }

  export type UserCreateWithoutMfaInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressCreateNestedManyWithoutUserInput
    passwordReset?: PasswordResetCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMfaInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressUncheckedCreateNestedManyWithoutUserInput
    passwordReset?: PasswordResetUncheckedCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMfaInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMfaInput, UserUncheckedCreateWithoutMfaInput>
  }

  export type TotpUpsertWithoutMfaInput = {
    update: XOR<TotpUpdateWithoutMfaInput, TotpUncheckedUpdateWithoutMfaInput>
    create: XOR<TotpCreateWithoutMfaInput, TotpUncheckedCreateWithoutMfaInput>
    where?: TotpWhereInput
  }

  export type TotpUpdateToOneWithWhereWithoutMfaInput = {
    where?: TotpWhereInput
    data: XOR<TotpUpdateWithoutMfaInput, TotpUncheckedUpdateWithoutMfaInput>
  }

  export type TotpUpdateWithoutMfaInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumTotpStatusFieldUpdateOperationsInput | $Enums.TotpStatus
    secret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TotpUncheckedUpdateWithoutMfaInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumTotpStatusFieldUpdateOperationsInput | $Enums.TotpStatus
    secret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasskeyUpsertWithoutMfaInput = {
    update: XOR<PasskeyUpdateWithoutMfaInput, PasskeyUncheckedUpdateWithoutMfaInput>
    create: XOR<PasskeyCreateWithoutMfaInput, PasskeyUncheckedCreateWithoutMfaInput>
    where?: PasskeyWhereInput
  }

  export type PasskeyUpdateToOneWithWhereWithoutMfaInput = {
    where?: PasskeyWhereInput
    data: XOR<PasskeyUpdateWithoutMfaInput, PasskeyUncheckedUpdateWithoutMfaInput>
  }

  export type PasskeyUpdateWithoutMfaInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicKey?: StringFieldUpdateOperationsInput | string
    privateKey?: StringFieldUpdateOperationsInput | string
    isActivated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasskeyUncheckedUpdateWithoutMfaInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicKey?: StringFieldUpdateOperationsInput | string
    privateKey?: StringFieldUpdateOperationsInput | string
    isActivated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutMfaInput = {
    update: XOR<UserUpdateWithoutMfaInput, UserUncheckedUpdateWithoutMfaInput>
    create: XOR<UserCreateWithoutMfaInput, UserUncheckedCreateWithoutMfaInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMfaInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMfaInput, UserUncheckedUpdateWithoutMfaInput>
  }

  export type UserUpdateWithoutMfaInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUpdateManyWithoutUserNestedInput
    passwordReset?: PasswordResetUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMfaInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUncheckedUpdateManyWithoutUserNestedInput
    passwordReset?: PasswordResetUncheckedUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUncheckedUpdateOneWithoutUserNestedInput
  }

  export type MultiFactorAuthenticationCreateWithoutPasskeyInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    totp?: TotpCreateNestedOneWithoutMfaInput
    user: UserCreateNestedOneWithoutMfaInput
  }

  export type MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    totpId?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MultiFactorAuthenticationCreateOrConnectWithoutPasskeyInput = {
    where: MultiFactorAuthenticationWhereUniqueInput
    create: XOR<MultiFactorAuthenticationCreateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput>
  }

  export type MultiFactorAuthenticationUpsertWithoutPasskeyInput = {
    update: XOR<MultiFactorAuthenticationUpdateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedUpdateWithoutPasskeyInput>
    create: XOR<MultiFactorAuthenticationCreateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedCreateWithoutPasskeyInput>
    where?: MultiFactorAuthenticationWhereInput
  }

  export type MultiFactorAuthenticationUpdateToOneWithWhereWithoutPasskeyInput = {
    where?: MultiFactorAuthenticationWhereInput
    data: XOR<MultiFactorAuthenticationUpdateWithoutPasskeyInput, MultiFactorAuthenticationUncheckedUpdateWithoutPasskeyInput>
  }

  export type MultiFactorAuthenticationUpdateWithoutPasskeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    totp?: TotpUpdateOneWithoutMfaNestedInput
    user?: UserUpdateOneRequiredWithoutMfaNestedInput
  }

  export type MultiFactorAuthenticationUncheckedUpdateWithoutPasskeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    totpId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MultiFactorAuthenticationCreateWithoutTotpInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    passkey?: PasskeyCreateNestedOneWithoutMfaInput
    user: UserCreateNestedOneWithoutMfaInput
  }

  export type MultiFactorAuthenticationUncheckedCreateWithoutTotpInput = {
    id?: string
    recoveryCodes?: MultiFactorAuthenticationCreaterecoveryCodesInput | string[]
    passkeyId?: string | null
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MultiFactorAuthenticationCreateOrConnectWithoutTotpInput = {
    where: MultiFactorAuthenticationWhereUniqueInput
    create: XOR<MultiFactorAuthenticationCreateWithoutTotpInput, MultiFactorAuthenticationUncheckedCreateWithoutTotpInput>
  }

  export type MultiFactorAuthenticationUpsertWithoutTotpInput = {
    update: XOR<MultiFactorAuthenticationUpdateWithoutTotpInput, MultiFactorAuthenticationUncheckedUpdateWithoutTotpInput>
    create: XOR<MultiFactorAuthenticationCreateWithoutTotpInput, MultiFactorAuthenticationUncheckedCreateWithoutTotpInput>
    where?: MultiFactorAuthenticationWhereInput
  }

  export type MultiFactorAuthenticationUpdateToOneWithWhereWithoutTotpInput = {
    where?: MultiFactorAuthenticationWhereInput
    data: XOR<MultiFactorAuthenticationUpdateWithoutTotpInput, MultiFactorAuthenticationUncheckedUpdateWithoutTotpInput>
  }

  export type MultiFactorAuthenticationUpdateWithoutTotpInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passkey?: PasskeyUpdateOneWithoutMfaNestedInput
    user?: UserUpdateOneRequiredWithoutMfaNestedInput
  }

  export type MultiFactorAuthenticationUncheckedUpdateWithoutTotpInput = {
    id?: StringFieldUpdateOperationsInput | string
    recoveryCodes?: MultiFactorAuthenticationUpdaterecoveryCodesInput | string[]
    passkeyId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LessonCreateWithoutCourseInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressCreateNestedManyWithoutLessonInput
  }

  export type LessonUncheckedCreateWithoutCourseInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressUncheckedCreateNestedManyWithoutLessonInput
  }

  export type LessonCreateOrConnectWithoutCourseInput = {
    where: LessonWhereUniqueInput
    create: XOR<LessonCreateWithoutCourseInput, LessonUncheckedCreateWithoutCourseInput>
  }

  export type LessonCreateManyCourseInputEnvelope = {
    data: LessonCreateManyCourseInput | LessonCreateManyCourseInput[]
    skipDuplicates?: boolean
  }

  export type LessonUpsertWithWhereUniqueWithoutCourseInput = {
    where: LessonWhereUniqueInput
    update: XOR<LessonUpdateWithoutCourseInput, LessonUncheckedUpdateWithoutCourseInput>
    create: XOR<LessonCreateWithoutCourseInput, LessonUncheckedCreateWithoutCourseInput>
  }

  export type LessonUpdateWithWhereUniqueWithoutCourseInput = {
    where: LessonWhereUniqueInput
    data: XOR<LessonUpdateWithoutCourseInput, LessonUncheckedUpdateWithoutCourseInput>
  }

  export type LessonUpdateManyWithWhereWithoutCourseInput = {
    where: LessonScalarWhereInput
    data: XOR<LessonUpdateManyMutationInput, LessonUncheckedUpdateManyWithoutCourseInput>
  }

  export type LessonScalarWhereInput = {
    AND?: LessonScalarWhereInput | LessonScalarWhereInput[]
    OR?: LessonScalarWhereInput[]
    NOT?: LessonScalarWhereInput | LessonScalarWhereInput[]
    id?: StringFilter<"Lesson"> | string
    title?: StringFilter<"Lesson"> | string
    slug?: StringFilter<"Lesson"> | string
    description?: StringNullableFilter<"Lesson"> | string | null
    position?: IntFilter<"Lesson"> | number
    kinescopeId?: StringNullableFilter<"Lesson"> | string | null
    isPublished?: BoolFilter<"Lesson"> | boolean
    courseId?: StringFilter<"Lesson"> | string
    createdAt?: DateTimeFilter<"Lesson"> | Date | string
    updatedAt?: DateTimeFilter<"Lesson"> | Date | string
  }

  export type UserProgressCreateWithoutLessonInput = {
    id?: string
    isCompleted?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutUserProgressInput
  }

  export type UserProgressUncheckedCreateWithoutLessonInput = {
    id?: string
    isCompleted?: boolean
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProgressCreateOrConnectWithoutLessonInput = {
    where: UserProgressWhereUniqueInput
    create: XOR<UserProgressCreateWithoutLessonInput, UserProgressUncheckedCreateWithoutLessonInput>
  }

  export type UserProgressCreateManyLessonInputEnvelope = {
    data: UserProgressCreateManyLessonInput | UserProgressCreateManyLessonInput[]
    skipDuplicates?: boolean
  }

  export type CourseCreateWithoutLessonsInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    thumbnail?: string | null
    youtubeUrl?: string | null
    codeUrl?: string | null
    isPublished?: boolean
    views?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseUncheckedCreateWithoutLessonsInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    thumbnail?: string | null
    youtubeUrl?: string | null
    codeUrl?: string | null
    isPublished?: boolean
    views?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseCreateOrConnectWithoutLessonsInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutLessonsInput, CourseUncheckedCreateWithoutLessonsInput>
  }

  export type UserProgressUpsertWithWhereUniqueWithoutLessonInput = {
    where: UserProgressWhereUniqueInput
    update: XOR<UserProgressUpdateWithoutLessonInput, UserProgressUncheckedUpdateWithoutLessonInput>
    create: XOR<UserProgressCreateWithoutLessonInput, UserProgressUncheckedCreateWithoutLessonInput>
  }

  export type UserProgressUpdateWithWhereUniqueWithoutLessonInput = {
    where: UserProgressWhereUniqueInput
    data: XOR<UserProgressUpdateWithoutLessonInput, UserProgressUncheckedUpdateWithoutLessonInput>
  }

  export type UserProgressUpdateManyWithWhereWithoutLessonInput = {
    where: UserProgressScalarWhereInput
    data: XOR<UserProgressUpdateManyMutationInput, UserProgressUncheckedUpdateManyWithoutLessonInput>
  }

  export type CourseUpsertWithoutLessonsInput = {
    update: XOR<CourseUpdateWithoutLessonsInput, CourseUncheckedUpdateWithoutLessonsInput>
    create: XOR<CourseCreateWithoutLessonsInput, CourseUncheckedCreateWithoutLessonsInput>
    where?: CourseWhereInput
  }

  export type CourseUpdateToOneWithWhereWithoutLessonsInput = {
    where?: CourseWhereInput
    data: XOR<CourseUpdateWithoutLessonsInput, CourseUncheckedUpdateWithoutLessonsInput>
  }

  export type CourseUpdateWithoutLessonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    youtubeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    codeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    views?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseUncheckedUpdateWithoutLessonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: NullableStringFieldUpdateOperationsInput | string | null
    youtubeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    codeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    views?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutUserProgressInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    passwordReset?: PasswordResetCreateNestedOneWithoutUserInput
    mfa?: MultiFactorAuthenticationCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUserProgressInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    passwordReset?: PasswordResetUncheckedCreateNestedOneWithoutUserInput
    mfa?: MultiFactorAuthenticationUncheckedCreateNestedOneWithoutUserInput
    deletionInfo?: DeletionInfoUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUserProgressInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserProgressInput, UserUncheckedCreateWithoutUserProgressInput>
  }

  export type LessonCreateWithoutUserProgressInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    course: CourseCreateNestedOneWithoutLessonsInput
  }

  export type LessonUncheckedCreateWithoutUserProgressInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    courseId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LessonCreateOrConnectWithoutUserProgressInput = {
    where: LessonWhereUniqueInput
    create: XOR<LessonCreateWithoutUserProgressInput, LessonUncheckedCreateWithoutUserProgressInput>
  }

  export type UserUpsertWithoutUserProgressInput = {
    update: XOR<UserUpdateWithoutUserProgressInput, UserUncheckedUpdateWithoutUserProgressInput>
    create: XOR<UserCreateWithoutUserProgressInput, UserUncheckedCreateWithoutUserProgressInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserProgressInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserProgressInput, UserUncheckedUpdateWithoutUserProgressInput>
  }

  export type UserUpdateWithoutUserProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passwordReset?: PasswordResetUpdateOneWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUserProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passwordReset?: PasswordResetUncheckedUpdateOneWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUncheckedUpdateOneWithoutUserNestedInput
    deletionInfo?: DeletionInfoUncheckedUpdateOneWithoutUserNestedInput
  }

  export type LessonUpsertWithoutUserProgressInput = {
    update: XOR<LessonUpdateWithoutUserProgressInput, LessonUncheckedUpdateWithoutUserProgressInput>
    create: XOR<LessonCreateWithoutUserProgressInput, LessonUncheckedCreateWithoutUserProgressInput>
    where?: LessonWhereInput
  }

  export type LessonUpdateToOneWithWhereWithoutUserProgressInput = {
    where?: LessonWhereInput
    data: XOR<LessonUpdateWithoutUserProgressInput, LessonUncheckedUpdateWithoutUserProgressInput>
  }

  export type LessonUpdateWithoutUserProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    course?: CourseUpdateOneRequiredWithoutLessonsNestedInput
  }

  export type LessonUncheckedUpdateWithoutUserProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    courseId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutDeletionInfoInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressCreateNestedManyWithoutUserInput
    passwordReset?: PasswordResetCreateNestedOneWithoutUserInput
    mfa?: MultiFactorAuthenticationCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDeletionInfoInput = {
    id?: string
    email: string
    password?: string | null
    username: string
    displayName: string
    avatar?: string | null
    points?: number
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    userProgress?: UserProgressUncheckedCreateNestedManyWithoutUserInput
    passwordReset?: PasswordResetUncheckedCreateNestedOneWithoutUserInput
    mfa?: MultiFactorAuthenticationUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDeletionInfoInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDeletionInfoInput, UserUncheckedCreateWithoutDeletionInfoInput>
  }

  export type UserUpsertWithoutDeletionInfoInput = {
    update: XOR<UserUpdateWithoutDeletionInfoInput, UserUncheckedUpdateWithoutDeletionInfoInput>
    create: XOR<UserCreateWithoutDeletionInfoInput, UserUncheckedCreateWithoutDeletionInfoInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDeletionInfoInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDeletionInfoInput, UserUncheckedUpdateWithoutDeletionInfoInput>
  }

  export type UserUpdateWithoutDeletionInfoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUpdateManyWithoutUserNestedInput
    passwordReset?: PasswordResetUpdateOneWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDeletionInfoInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: NullableStringFieldUpdateOperationsInput | string | null
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    points?: IntFieldUpdateOperationsInput | number
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUncheckedUpdateManyWithoutUserNestedInput
    passwordReset?: PasswordResetUncheckedUpdateOneWithoutUserNestedInput
    mfa?: MultiFactorAuthenticationUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserProgressCreateManyUserInput = {
    id?: string
    isCompleted?: boolean
    lessonId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProgressUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lesson?: LessonUpdateOneRequiredWithoutUserProgressNestedInput
  }

  export type UserProgressUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    lessonId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    lessonId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LessonCreateManyCourseInput = {
    id?: string
    title: string
    slug: string
    description?: string | null
    position: number
    kinescopeId?: string | null
    isPublished?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LessonUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUpdateManyWithoutLessonNestedInput
  }

  export type LessonUncheckedUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userProgress?: UserProgressUncheckedUpdateManyWithoutLessonNestedInput
  }

  export type LessonUncheckedUpdateManyWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    kinescopeId?: NullableStringFieldUpdateOperationsInput | string | null
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressCreateManyLessonInput = {
    id?: string
    isCompleted?: boolean
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProgressUpdateWithoutLessonInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutUserProgressNestedInput
  }

  export type UserProgressUncheckedUpdateWithoutLessonInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProgressUncheckedUpdateManyWithoutLessonInput = {
    id?: StringFieldUpdateOperationsInput | string
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CourseCountOutputTypeDefaultArgs instead
     */
    export type CourseCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CourseCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LessonCountOutputTypeDefaultArgs instead
     */
    export type LessonCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LessonCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PasswordResetDefaultArgs instead
     */
    export type PasswordResetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PasswordResetDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MultiFactorAuthenticationDefaultArgs instead
     */
    export type MultiFactorAuthenticationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MultiFactorAuthenticationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PasskeyDefaultArgs instead
     */
    export type PasskeyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PasskeyDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TotpDefaultArgs instead
     */
    export type TotpArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TotpDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CourseDefaultArgs instead
     */
    export type CourseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CourseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LessonDefaultArgs instead
     */
    export type LessonArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LessonDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserProgressDefaultArgs instead
     */
    export type UserProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserProgressDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DeletionInfoDefaultArgs instead
     */
    export type DeletionInfoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DeletionInfoDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}