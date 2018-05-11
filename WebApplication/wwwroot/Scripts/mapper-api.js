var api = function () {
//    this.url = prompt("Enter server URL:", "http://localhost:5001");
//    this.courseId = "3428bb12-3c87-4c4c-951f-311eca2d5d38";
};

api.getPolygons = function (_courseId, _callback) {
    $.get("http://" + this.url + "/golfCourse/GetPolygons?courseId=" + 
        _courseId,
        function(_data, status) {
            if (_data == null || typeof _data == 'undefined') {
                console.log("Failed to load course.\ncourseId: " + _courseId);
            }
            _callback(_data);
        }
    );
}

api.addPolygon = function (_courseId, _data, _type, _callback) {
    $.post("http://" + this.url + "/golfCourse/AddPolygon",
        {
            courseId: _courseId,
            geoJson: _data,
            Type: _type
        },
        function (returnedData) {
            _callback(returnedData);
        }
    )
}

// Not used at the moment
api.getCourses = function (_courseId, callback) {
    $.get(this.url + "/GolfCourse/GetPolygons?courseId=" + _courseId,
        function(data, status) {
            alert("Data: " + data + "\n" + status);
        });
}

api.createCourse = function (_courseName, _callback) {
    $.post("http://" + this.url + "/GolfCourse/CreateCourse", 
        {CourseName: _courseName},
        function (returnedData) {
            _callback(returnedData);
        }
    );
};
