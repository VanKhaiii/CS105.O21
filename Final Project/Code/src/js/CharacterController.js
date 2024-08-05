import * as THREE from 'three';
var clock= new THREE.Clock();

export class CharacterController {
    static runKey = "Armature.001|WalkAnimation";
    static crouchKey = "Armature.001|CrouchWalkAnimation";
    static runHeight = 5.5;
    static crouchHeight = CharacterController.runHeight / 2;
    static runCenterY = 2.75;
    static crouchCenterY = CharacterController.runHeight / 4;
    static runModelY = -2.75;
    static crouchModelY = -2;

    constructor (model, bbox, mixer, animationsMap, camera) {
        this.model = model;
        this.bbox = bbox;
        this.mixer = mixer;
        this.animationsMap = animationsMap;
        this.camera = camera;
        this.currentAnimation = CharacterController.runKey;
        this.animationsMap.get(this.currentAnimation).play();

        this.canJump = true;
        this.onlyDown = false;

        this.velocityY = 0;
        this.velocityX = 0.2;

        this.fadeDuration = 0;

        this.isStoppable = true;

        this.updateSides();
    }

    checkObstaclesHit (obstacles) {
        for (var vertexIndex = 0; vertexIndex < this.bbox.geometry.attributes.position.array.length; vertexIndex++)
        {
            var localVertex = new THREE.Vector3().fromBufferAttribute(this.bbox.geometry.attributes.position, vertexIndex).clone();
            var globalVertex = localVertex.applyMatrix4(this.bbox.matrix);
            var directionVector = globalVertex.sub(this.bbox.position);

            var ray = new THREE.Raycaster(this.bbox.position, directionVector.clone().normalize());

            var collisionResults = ray.intersectObjects(obstacles.map((obs) => obs.body));

            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
                return true;
        }

        return false;
    }

    checkItemPickup (item) {
        const xCollision = this.right >= item.left && this.left <= item.right;
        const yCollision = this.top >= item.bottom && this.bottom <= item.top;
        const zCollision = this.front >= item.back && this.back <= item.front;

        return (xCollision && yCollision && zCollision);
    }

    updateSides () {
        this.right = this.bbox.position.x + this.getWidth() / 2;
        this.left = this.bbox.position.x - this.getWidth() / 2;
        this.front = this.bbox.position.z + this.getDepth() / 2;
        this.back = this.bbox.position.z - this.getDepth() / 2;
        this.top = this.bbox.position.y + this.getHeight() / 2;
        this.bottom = this.bbox.position.y - this.getHeight() / 2;
    }

    getWidth () {
        return this.bbox.geometry.parameters.width;
    }

    getHeight () {
        return this.bbox.geometry.parameters.height;
    }

    getDepth () {
        return this.bbox.geometry.parameters.depth;
    }

    changeVision (mode) {
        this.camera.far = mode ? 80 : 40;
        this.camera.updateProjectionMatrix();
    }

    updateCamera (isFirstPerson) {
        if (isFirstPerson) {
            this.camera.position.set(
                this.bbox.position.x,
                this.bbox.position.y + 2.75,
                0.5,
            )
    
            this.camera.lookAt(new THREE.Vector3(
                this.bbox.position.x,
                this.bbox.position.y + 1,
                5,
            ));
        }
        else {
            this.camera.position.set(
                this.bbox.position.x,
                this.bbox.position.y + 7,
                this.bbox.position.z - 7,
            )

            this.camera.lookAt(new THREE.Vector3(
                this.bbox.position.x,
                this.bbox.position.y,
                this.bbox.position.z + 5,
            ));
        }
    }

    update (delta, keyboard, ground, isFirstPerson) {
        // Right side corresponds to direction of x axis, not right side of the character
        // Left - A, i.e, character moves torward the right side
        const newRight = this.bbox.position.x + this.velocityX + this.getWidth() / 2;
        if (keyboard[65] && newRight <= ground.right) this.bbox.position.x += this.velocityX;
        // if (keyboard[65]) this.bbox.position.x += this.velocityX;

        // Right - D, i.e, character moves torward the left side
        const newLeft = this.bbox.position.x - this.velocityX - this.getWidth() / 2
        if (keyboard[68] && newLeft >= ground.left) this.bbox.position.x -= this.velocityX;
        // if (keyboard[68]) this.bbox.position.x -= this.velocityX;

        // down letter S
        let play;

        if (keyboard[83]) {
            if (this.canJump) {
                play = CharacterController.crouchKey;
            }
            else {
                this.onlyDown = true;
            }
        }
        else {
            play = CharacterController.runKey;
        }

        // Jump - W
        if (keyboard[87] && this.canJump) {
            this.canJump = false;
            this.velocityY = 7;
        }

        this.bbox.position.y += this.velocityY * 2 * delta;

        if(!this.canJump){
            if (this.onlyDown)
                this.velocityY = -10;
            else
                this.velocityY -= 9.8 * delta;

            if (this.bbox.position.y <= this.getHeight() / 2) {
                this.canJump = true;
                this.velocityY=0;
                this.bbox.position.y = this.getHeight() / 2;

                if (this.onlyDown)
                    this.onlyDown  = false;
            }
        }

        // Change animation
        if (play && this.currentAnimation != play) {
            const toPlay = this.animationsMap.get(play);
            const current = this.animationsMap.get(this.currentAnimation);

            current.fadeOut(this.fadeDuration);
            toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAnimation = play;

            // Change size of bbox
            if (play == CharacterController.crouchKey) {
                this.bbox.geometry.scale(1, 0.5, 1);
                this.bbox.position.y = CharacterController.crouchCenterY;
                this.model.position.y = CharacterController.crouchModelY;
            }
            else {
                this.bbox.geometry.scale(1, 2, 1);
                this.bbox.position.y = CharacterController.runCenterY;
                this.model.position.y = CharacterController.runModelY;
            }
        }

        this.mixer.update(delta);

        // Update sides
        this.updateSides();
        this.updateCamera(isFirstPerson);
    }
}