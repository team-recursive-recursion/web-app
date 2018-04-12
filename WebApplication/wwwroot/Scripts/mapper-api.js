var api = function () {
//    this.url = prompt("Enter server URL:", "http://localhost:5001");
//    this.courseId = "3428bb12-3c87-4c4c-951f-311eca2d5d38";
};

api.getPolygons = function (_courseID, _callback) {
    $.get("http://" + this.url + "/golfCourse/GetPolygons?courseId=" + 
        _courseID,
        function(_data, status) {
            if (_data == null || typeof _data == 'undefined') {
                console.log("Failed to load course.\ncourseId: " + _courseId);
            }
            _callback(_data);
        }
    );
}

api.addPolygon = function (courseId, data, type, callback) {
    $.post("http://" + this.url + "/golfCourse/AddPolygon",
        {
            courseId: courseId,
            geoJson: data,
            Type: type
        },
        function (returnedData) {
            apiPolygons = data;
            callback(returnedData);
        }
    )
}

/*
api.getCourses = function (courseName, callback) {
    $.get(this.url + "/GolfCourse/GetPolygons?courseId=" + this.courseId,
        function(data, status) {
            alert("Data: " + data + "\n" + status);
        });
}
*/

api.createCourse = function (courseName, callback) {
    $.post("http://" + this.url + "/GolfCourse/CreateCourse", 
        {CourseName: courseName},
        function (returnedData) {
            callback(returnedData);
        }
    );
};
        
        
       
