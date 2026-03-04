
IMAGE="varshithknaik/notification-app"
ENV_FILE="./FE/.env.production"
VERSION="v1.0.4"

BUILD_ARGS=$(grep -vE '^(#/$)' $ENV_FILE | sed 's/^/--build-arg /');

docker build $BUILD_ARGS -t $IMAGE:$VERSION .

echo "Built $IMAGE:$VERSION"

docker push $IMAGE:$VERSION

echo "Pushed $IMAGE:$VERSION"