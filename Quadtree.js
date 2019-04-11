const Point = function(x, y) {
	this.x = x;
	this.y = y;
}

const AABB = function(centerPoint, width, height) {

	this.centerPoint = centerPoint;
	this.width = width;
	this.height = height;

	this.containsPoint = function(point) {
		let left = this.centerPoint.x - (this.width * 0.5);
		let top = this.centerPoint.y - (this.height * 0.5);
		let right = left + this.width;
		let bottom = top + this.height;

		let doesContain = 	(point.x >= left && point.x <= right) &&
							(point.y >= top && point.y <= bottom);
		return doesContain;
	}

	this.intersectsAABB = function(other) {
		let left = this.centerPoint.x - (this.width * 0.5);
		let right = this.centerPoint.x + (this.width * 0.5);
		let top = this.centerPoint.y - (this.height * 0.5);
		let bottom = this.centerPoint.y + (this.height * 0.5);

		let otherLeft = other.centerPoint.x - (other.width * 0.5);
		let otherRight = other.centerPoint.x + (other.width * 0.5);
		let otherTop = other.centerPoint.y - (other.height * 0.5);
		let otherBottom = other.centerPoint.y + (other.height * 0.5);

		let intersectTopBottom = ((top <= otherBottom && bottom >= otherTop) || (top >= otherBottom && bottom <= otherTop));
		let intersectLeftRight = ((left <= otherRight && right >= otherLeft) || (left >= otherRight && right <= otherLeft));

		return 	intersectLeftRight && intersectTopBottom;
	}
}

let Quadtree = function(boundary, capacity) {
	const _boundary = boundary;
	const _capacity = capacity;
	const _elements = [];

	this.getBoundary = function() {
		return _boundary;
	}

	this.getPoints = function() {
		return _elements.map((element) => {
			return element.point;
		});
	}

    this.insertAll = function(elements) {
        elements.forEach((el) => {
            this.insert(el);
        });
    }

	this.insert = function(element) {
		if (!_boundary.containsPoint(element.point)) {
			return false;
		}

		if (_elements.length < _capacity && !this.nw) {
			_elements.push(element);
			return true;
		} else if (!this.nw) {
			this.subdivide();
		}

		if (this.nw.insert(element)) {
			return true;
		}

		if (this.ne.insert(element)) {
			return true;
		}

		if (this.sw.insert(element)) {
			return true;
		}

		if (this.se.insert(element)) {
			return true;
		}


		return false;
	}

	this.subdivide = function() {
		let x = _boundary.centerPoint.x;
		let y = _boundary.centerPoint.y;

		let newXSize = _boundary.width * 0.5;
		let newYSize = _boundary.height * 0.5;
		let halfX = newXSize * 0.5;
		let halfY = newYSize * 0.5;

		this.nw = new Quadtree(new AABB(new Point(x - (halfX), y - (halfY)), newXSize, newYSize), _capacity);
		this.ne = new Quadtree(new AABB(new Point(x + (halfX), y - (halfY)), newXSize, newYSize), _capacity);
		this.sw = new Quadtree(new AABB(new Point(x - (halfX), y + (halfY)), newXSize, newYSize), _capacity);
		this.se = new Quadtree(new AABB(new Point(x + (halfX), y + (halfY)), newXSize, newYSize), _capacity);
	}

	this.queryRange = function(rangeAABB) {
		let elementsInRange = [];

		if (!_boundary.intersectsAABB(rangeAABB)) return elementsInRange;

		_elements.forEach((element) => {
			if (rangeAABB.containsPoint(element.point)) {
				elementsInRange.push(element);
			}
		});

		if (!this.nw) return elementsInRange;

		let elements;
		if ((elements = this.nw.queryRange(rangeAABB)).length > 0) elementsInRange.push.apply(elementsInRange, elements);
		if ((elements = this.ne.queryRange(rangeAABB)).length > 0) elementsInRange.push.apply(elementsInRange, elements);
		if ((elements = this.sw.queryRange(rangeAABB)).length > 0) elementsInRange.push.apply(elementsInRange, elements);
		if ((elements = this.se.queryRange(rangeAABB)).length > 0) elementsInRange.push.apply(elementsInRange, elements);

		return elementsInRange;
	}

	this.debugRender = function(col, weight) {
		noFill();
		strokeWeight(weight);
		stroke(col);

		let xStart = _boundary.centerPoint.x - (_boundary.width * 0.5);
		let yStart = _boundary.centerPoint.y - (_boundary.height * 0.5);
		let width = _boundary.width;
		let height = _boundary.height;
		rect(xStart, yStart, width, height);

		if (this.nw) {
			this.nw.debugRender(col, weight);
			this.ne.debugRender(col, weight);
			this.sw.debugRender(col, weight);
			this.se.debugRender(col, weight);
		}
	}

	this.numChildren = function() {
		let runningTotal = (this.nw ? 4 : 0);

		if (this.nw) {
			runningTotal += this.nw.numChildren();
			runningTotal += this.ne.numChildren();
			runningTotal += this.sw.numChildren();
			runningTotal += this.se.numChildren();
		}

		return runningTotal;
	}
}